import fs from "node:fs/promises";
import process from "node:process";
import stringWidth from "string-width";

const dw = (text) => stringWidth(text);

const segmenter =
	typeof Intl !== "undefined" && Intl.Segmenter
		? new Intl.Segmenter(undefined, { granularity: "grapheme" })
		: null;

function truncateToWidth(text, maxWidth, ellipsis = "…") {
	const input = String(text);
	if (dw(input) <= maxWidth) return input;
	const ellipsisWidth = dw(ellipsis);
	if (maxWidth <= ellipsisWidth) return ellipsis;

	const budget = maxWidth - ellipsisWidth;
	let out = "";
	let used = 0;

	if (segmenter) {
		for (const { segment } of segmenter.segment(input)) {
			const w = dw(segment);
			if (used + w > budget) break;
			out += segment;
			used += w;
		}
		return out + ellipsis;
	}

	for (const ch of input) {
		const w = dw(ch);
		if (used + w > budget) break;
		out += ch;
		used += w;
	}
	return out + ellipsis;
}

function padRightToWidth(text, width) {
	const w = dw(text);
	if (w >= width) return text;
	return text + " ".repeat(width - w);
}

function cell(text, width, align = "left") {
	const fitted = truncateToWidth(text, width);
	const w = dw(fitted);
	const padding = width - w;
	if (padding <= 0) return fitted;
	if (align === "right") return " ".repeat(padding) + fitted;
	if (align === "center") {
		const left = Math.floor(padding / 2);
		const right = padding - left;
		return " ".repeat(left) + fitted + " ".repeat(right);
	}
	return fitted + " ".repeat(padding);
}

function inferColumnContentWidth(column, rows) {
	const header = String(column?.header ?? column?.key ?? "");
	let max = dw(header);
	for (const row of rows ?? []) {
		const key = column?.key;
		const value = key ? row?.[key] : "";
		max = Math.max(max, dw(String(value ?? "")));
	}
	return max;
}

function computeNaturalColumnWidths(columns, rows) {
	return columns.map((column, idx) => {
		const col = column ?? {};
		if (Number.isInteger(col.width)) {
			if (col.width < 1) {
				throw new Error(`columns[${idx}].width must be an integer >= 1 (got ${col.width})`);
			}
			return col.width;
		}

		const minWidth = Number.isInteger(col.minWidth) ? col.minWidth : 1;
		const maxWidth = Number.isInteger(col.maxWidth) ? col.maxWidth : Infinity;
		if (minWidth < 1) {
			throw new Error(`columns[${idx}].minWidth must be an integer >= 1 (got ${col.minWidth})`);
		}
		if (maxWidth < minWidth) {
			throw new Error(
				`columns[${idx}].maxWidth must be >= minWidth (got ${col.maxWidth} < ${minWidth})`,
			);
		}

		const desired = inferColumnContentWidth(col, rows);
		return Math.min(maxWidth, Math.max(minWidth, desired));
	});
}

function computeTableColumnWidths(columns, rows, available) {
	const widths = columns.map(() => 0);
	const minWidths = columns.map(() => 1);
	const maxWidths = columns.map(() => Infinity);
	const fixed = columns.map(() => false);

	let fixedSum = 0;
	let minAutoSum = 0;

	for (let idx = 0; idx < columns.length; idx += 1) {
		const column = columns[idx] ?? {};
		if (Number.isInteger(column.width)) {
			if (column.width < 1) {
				throw new Error(`columns[${idx}].width must be an integer >= 1 (got ${column.width})`);
			}
			widths[idx] = column.width;
			minWidths[idx] = column.width;
			maxWidths[idx] = column.width;
			fixed[idx] = true;
			fixedSum += column.width;
			continue;
		}

		const minWidth = Number.isInteger(column.minWidth) ? column.minWidth : 1;
		const maxWidth = Number.isInteger(column.maxWidth) ? column.maxWidth : Infinity;
		if (minWidth < 1) {
			throw new Error(
				`columns[${idx}].minWidth must be an integer >= 1 (got ${column.minWidth})`,
			);
		}
		if (maxWidth < minWidth) {
			throw new Error(
				`columns[${idx}].maxWidth must be >= minWidth (got ${column.maxWidth} < ${minWidth})`,
			);
		}

		const desired = inferColumnContentWidth(column, rows);
		const clamped = Math.min(maxWidth, Math.max(minWidth, desired));
		widths[idx] = clamped;
		minWidths[idx] = minWidth;
		maxWidths[idx] = maxWidth;
		minAutoSum += minWidth;
	}

	const allFixed = fixed.every(Boolean);
	const totalInitial = widths.reduce((a, b) => a + b, 0);
	if (allFixed) {
		if (totalInitial > available) {
			throw new Error(
				`Column widths (${totalInitial}) exceed available width (${available}). Tip: omit columns[].width to auto-fit or increase table.width.`,
			);
		}
		return widths;
	}

	if (fixedSum + minAutoSum > available) {
		throw new Error(
			`Fixed widths (${fixedSum}) plus auto min widths (${minAutoSum}) exceed available (${available}).`,
		);
	}

	let total = totalInitial;
	if (total > available) {
		while (total > available) {
			let bestIdx = -1;
			let bestSlack = 0;
			for (let i = 0; i < columns.length; i += 1) {
				if (fixed[i]) continue;
				const slack = widths[i] - minWidths[i];
				if (slack > bestSlack) {
					bestSlack = slack;
					bestIdx = i;
				}
			}
			if (bestIdx === -1) break;
			widths[bestIdx] -= 1;
			total -= 1;
		}
		if (total > available) {
			throw new Error(`Cannot fit table columns into available width (${available}).`);
		}
		return widths;
	}

	if (total < available) {
		let remaining = available - total;
		const autoIdx = [];
		const unboundedIdx = [];
		for (let i = 0; i < columns.length; i += 1) {
			if (fixed[i]) continue;
			autoIdx.push(i);
			if (!Number.isFinite(maxWidths[i])) unboundedIdx.push(i);
		}
		if (autoIdx.length === 0) return widths;

		if (unboundedIdx.length > 0) {
			widths[unboundedIdx[unboundedIdx.length - 1]] += remaining;
			return widths;
		}

		while (remaining > 0) {
			let progressed = false;
			for (const i of autoIdx) {
				if (remaining === 0) break;
				if (widths[i] >= maxWidths[i]) continue;
				widths[i] += 1;
				remaining -= 1;
				progressed = true;
			}
			if (!progressed) break;
		}
	}

	return widths;
}

function blockWidth(lines) {
	let max = 0;
	for (const line of lines) max = Math.max(max, dw(line));
	return max;
}

function renderBox({ width, title, lines }) {
	let boxWidth = width;
	if (boxWidth === undefined || boxWidth === null) {
		const titleWidth = title ? dw(String(title)) : 0;
		let linesWidth = 0;
		for (const line of lines ?? []) linesWidth = Math.max(linesWidth, dw(String(line)));
		boxWidth = Math.max(4, Math.max(titleWidth, linesWidth) + 2);
	} else if (!Number.isInteger(boxWidth) || boxWidth < 4) {
		throw new Error(`box.width must be an integer >= 4 (got ${boxWidth})`);
	}

	const inner = boxWidth - 2;
	const top = `+${"-".repeat(inner)}+`;
	const out = [top];
	if (title) out.push(`|${cell(title, inner, "center")}|`);
	for (const line of lines ?? []) out.push(`|${cell(line, inner)}|`);
	out.push(top);
	return out;
}

function renderTable({ width, title, columns, rows }) {
	if (!Array.isArray(columns) || columns.length === 0) {
		throw new Error("table.columns must be a non-empty array");
	}

	const separators = columns.length - 1;
	const naturalColWidths = computeNaturalColumnWidths(columns, rows);
	const naturalInner = naturalColWidths.reduce((a, b) => a + b, 0) + separators;

	let tableWidth = width;
	let inner;
	if (tableWidth === undefined || tableWidth === null) {
		const titleWidth = title ? dw(String(title)) : 0;
		inner = Math.max(2, naturalInner, titleWidth);
		tableWidth = inner + 2;
	} else if (!Number.isInteger(tableWidth) || tableWidth < 4) {
		throw new Error(`table.width must be an integer >= 4 (got ${tableWidth})`);
	} else {
		inner = tableWidth - 2;
	}

	const sep = `+${"-".repeat(inner)}+`;
	const available = inner - separators;
	const colWidths =
		tableWidth === width && width !== undefined && width !== null
			? computeTableColumnWidths(columns, rows, available)
			: naturalColWidths;

	const headerRow = columns
		.map((c, idx) => cell(c.header ?? c.key ?? "", colWidths[idx], c.align ?? "left"))
		.join("|");

	const dataRows = (rows ?? []).map((row) =>
		columns
			.map((c, idx) => cell(row?.[c.key] ?? "", colWidths[idx], c.align ?? "left"))
			.join("|"),
	);

	return [
		sep,
		...(title ? [`|${cell(title, inner, "center")}|`, sep] : []),
		`|${padRightToWidth(headerRow, inner)}|`,
		sep,
		...dataRows.map((r) => `|${padRightToWidth(r, inner)}|`),
		sep,
	];
}

function vstack(blocks, gap = 1) {
	const maxWidth = Math.max(0, ...blocks.map(blockWidth));
	const out = [];
	for (let i = 0; i < blocks.length; i += 1) {
		const block = blocks[i];
		for (const line of block) out.push(padRightToWidth(line, maxWidth));
		if (i < blocks.length - 1) {
			for (let g = 0; g < gap; g += 1) out.push(" ".repeat(maxWidth));
		}
	}
	return out;
}

function hstack(blocks, gap = 2) {
	const widths = blocks.map(blockWidth);
	const height = Math.max(0, ...blocks.map((b) => b.length));

	const paddedBlocks = blocks.map((block, idx) => {
		const width = widths[idx];
		const fill = " ".repeat(width);
		const padded = block.map((line) => padRightToWidth(line, width));
		while (padded.length < height) padded.push(fill);
		return padded;
	});

	const out = [];
	const sep = " ".repeat(gap);
	for (let row = 0; row < height; row += 1) {
		out.push(paddedBlocks.map((b) => b[row]).join(sep));
	}
	return out;
}

function renderSpec(spec) {
	if (!spec || typeof spec !== "object") throw new Error("Spec must be an object");
	switch (spec.type) {
		case "box":
			return renderBox(spec);
		case "table":
			return renderTable(spec);
		case "vstack":
			return vstack((spec.children ?? []).map(renderSpec), spec.gap ?? 1);
		case "hstack":
			return hstack((spec.children ?? []).map(renderSpec), spec.gap ?? 2);
		default:
			throw new Error(`Unknown spec.type: ${String(spec.type)}`);
	}
}

function demoSpec(name) {
	if (name === "table") {
		return {
			type: "table",
			width: 88,
			title: "工单列表 / Work Orders (Demo)",
			columns: [
				{ key: "id", header: "工单号 ID", width: 12 },
				{ key: "name", header: "名称 Name", width: 28 },
				{ key: "status", header: "状态 Status", width: 20 },
				{ key: "owner", header: "负责人 Owner", width: 14 },
				{ key: "updated", header: "更新时间", width: 8, align: "right" },
			],
			rows: [
				{
					id: "WO-1024",
					name: "工单加载 / Load Job",
					status: "进行中 In Progress",
					owner: "张三 / Alice",
					updated: "09:10",
				},
				{
					id: "WO-1023",
					name: "物料校验 Material Validation (LOT-8891)",
					status: "⚠ 异常 Failed",
					owner: "李四 / Bob",
					updated: "08:40",
				},
				{
					id: "WO-1022",
					name: "追溯 Traceability 生成 (Batch)",
					status: "✅ 完成 Done",
					owner: "王五 / Carol",
					updated: "08:05",
				},
			],
		};
	}

	if (name === "dashboard") {
		return {
			type: "hstack",
			gap: 2,
			children: [
				{
					type: "box",
					width: 30,
					title: "导航 / Nav",
					lines: [
						"• 仪表盘 Dashboard",
						"• 工单 Work Orders",
						"• 数据采集 Data Collect",
						"• 追溯 Trace",
						"• 设置 Settings",
					],
				},
				{
					type: "box",
					width: 56,
					title: "详情 / Details",
					lines: [
						"工单：WO-1024  | 产品：P-1001",
						"状态：进行中 In Progress",
						"进度：120/500  [███████░░░░░░]",
						"下一步：OP-20 点检/测量  (Station A)",
						"Actions: [开始 Start] [暂停 Pause] [完工 Finish]",
					],
				},
			],
		};
	}

	if (name === "tree") {
		return {
			type: "hstack",
			gap: 2,
			children: [
				{
					type: "box",
					width: 44,
					title: "流程树 / Tree",
					lines: [
						"工艺路线 / Route",
						"├─ OP-10 上料 Load  (✅ Done)",
						"├─ OP-20 点检 Inspect (⏳ Running)",
						"│  ├─ 采集 Data: 温度 Temp",
						"│  └─ 采集 Data: 扭矩 Torque",
						"└─ OP-30 包装 Pack  (• Pending)",
					],
				},
				{
					type: "table",
					width: 42,
					title: "采集项 / Data Points",
					columns: [
						{ key: "k", header: "项目 Item", width: 18 },
						{ key: "v", header: "值 Value", width: 12 },
						{ key: "s", header: "状态", width: 8 },
					],
					rows: [
						{ k: "温度 Temp(℃)", v: "36.5", s: "OK" },
						{ k: "扭矩 Torque(N·m)", v: "11.2", s: "OK" },
						{ k: "外观 Visual", v: "N/A", s: "待填" },
					],
				},
			],
		};
	}

	if (name === "all") {
		return {
			type: "vstack",
			gap: 1,
			children: [
				demoSpec("table"),
				{ type: "box", width: 88, title: "= DEMO =", lines: [] },
				demoSpec("dashboard"),
				{ type: "box", width: 88, title: "= DEMO =", lines: [] },
				demoSpec("tree"),
			],
		};
	}

	throw new Error(`Unknown demo name: ${name}`);
}

function parseArgs(argv) {
	const args = { demo: null, specPath: null, markdown: false };
	for (let i = 2; i < argv.length; i += 1) {
		const a = argv[i];
		if (a === "--demo") {
			args.demo = argv[i + 1];
			i += 1;
			continue;
		}
		if (a === "--spec") {
			args.specPath = argv[i + 1];
			i += 1;
			continue;
		}
		if (a === "--markdown") {
			args.markdown = true;
			continue;
		}
		if (a === "--help" || a === "-h") {
			args.help = true;
			continue;
		}
		throw new Error(`Unknown arg: ${a}`);
	}
	return args;
}

function usage() {
	return [
		"Usage:",
		"  bun scripts/render-wireframe.mjs --demo all [--markdown]",
		"  bun scripts/render-wireframe.mjs --spec path/to/spec.json [--markdown]",
		"",
		"Demos: table | dashboard | tree | all",
		"Spec types: box | table | hstack | vstack",
	].join("\n");
}

async function readStdin() {
	const chunks = [];
	for await (const chunk of process.stdin) chunks.push(chunk);
	return Buffer.concat(chunks).toString("utf8");
}

const args = parseArgs(process.argv);
if (args.help) {
	console.log(usage());
	process.exit(0);
}

let spec;
if (args.demo) {
	spec = demoSpec(args.demo);
} else if (args.specPath) {
	spec = JSON.parse(await fs.readFile(args.specPath, "utf8"));
} else if (!process.stdin.isTTY) {
	spec = JSON.parse(await readStdin());
} else {
	console.error(usage());
	process.exit(1);
}

const lines = renderSpec(spec);
const output = lines.join("\n");
if (args.markdown) {
	process.stdout.write(`\n\`\`\`text\n${output}\n\`\`\`\n`);
} else {
	process.stdout.write(`${output}\n`);
}
