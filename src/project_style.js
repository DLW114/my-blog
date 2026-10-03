import { Assets, Text } from "pixi.js";

let project_list = null;
let app = null;
let lines = []; // 每行：{ items:[{label,baseX,width}], totalWidth }
let globalOffset = 0; // 全局滚动偏移

// ⭐ 紧凑参数 —— 就调这几个
const PAD_X = 5; // 左右间隔 ≈ 2-3 个字母
const PAD_Y = 2; // 上下间隔（像素）
export const FONT_SIZE = 22;
const LINE_HEIGHT = FONT_SIZE + PAD_Y * 2; // 每行占用高度 = 22 + 8 = 30px
const SPEED = 1; // 每帧左移像素
const EXTRA_BUFFER = 400; // 右侧缓冲宽度，防露空

export async function getMyProject() {
    project_list = await Assets.load("/list/pj.json");
    return project_list;
}

export function initProjects(pixiApp) {
    app = pixiApp;
    build();
    app.ticker.add((ticker) => update(ticker.deltaTime));
}

export function relayoutProjects() {
    if (!app) return;
    clear();
    build();
}

function build() {
    if (!project_list || !app) return;

    const entries = Object.entries(project_list);
    if (entries.length === 0) return;

    const W = app.screen.width;
    const H = app.screen.height;
    const rows = Math.ceil(H / LINE_HEIGHT) + 1; // 多铺 1 行

    for (let r = 0; r < rows; r++) {
        const lineItems = [];
        let x = 0;
        let idx = r * 3; // 每行起始错开，视觉不呆板

        // ⭐ 一直铺到超出屏幕 + 缓冲宽度
        while (x < W + EXTRA_BUFFER) {
            const [name, url] = entries[idx % entries.length];
            idx++;

            const label = createLinkItem(name, url);
            label.anchor.set(0, 0.5); // 左中对齐

            const w = label.width; // ⭐ 文字实际宽度
            label.x = x;
            label.y = r * LINE_HEIGHT + LINE_HEIGHT / 2;
            app.stage.addChild(label);

            lineItems.push({ label, baseX: x, width: w });
            x += w + PAD_X; // ⭐ 关键：按实际宽度推进
        }

        lines.push({ items: lineItems, totalWidth: x });
    }
}

function createLinkItem(name, url) {
    const full = /^https?:\/\//.test(url) ? url : `https://${url}`;

    const label = new Text({
        text: name,
        style: {
            fill: "#202020",
            fontSize: FONT_SIZE,
            fontFamily: "AlegreSans-Regular-1",
        },
    });

    label.eventMode = "static";
    label.cursor = "pointer";
    label.on("pointerover", () => (label.style.fill = 0xffffff));
    label.on("pointerout", () => (label.style.fill = 0x66ccff));
    label.on("pointertap", () => {
        const win = window.open(full, "_blank");
        if (!win) location.href = full;
    });

    return label;
}

function update(dt) {
    globalOffset += SPEED * dt;

    for (const line of lines) {
        const offset = globalOffset % line.totalWidth;
        for (const item of line.items) {
            let x = item.baseX - offset;
            if (x + item.width < 0) {
                x += line.totalWidth; // ⭐ 完全出屏 → 从右侧补回
            }
            item.label.x = x;
        }
    }
}

function clear() {
    for (const line of lines) {
        for (const item of line.items) {
            item.label.destroy();
        }
    }
    lines.length = 0;
}
