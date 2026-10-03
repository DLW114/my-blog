/**
 * Copyright (C) 2026  DLW114
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Application, Text } from "pixi.js";
import {
  getMyProject,
  initProjects,
  relayoutProjects,
} from "./project_style.js";

(async () => {
  const app = new Application();
  await app.init({
    background: "#121212",
    resizeTo: window,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  const container = document.getElementById("pixi-container");
  if (!container) {
    throw new Error("Pixi container element was not found");
  }
  container.appendChild(app.canvas);

  // 等字体就绪
  await document.fonts.load("100px bai");
  await document.fonts.load("22px AlegreSans-Regular-1");

  // ⭐ 先建网格（在底层），再建标题（在上层）
  await getMyProject();
  initProjects(app);

  const title = new Text({
    text: "DLW114's blog",
    style: {
      fontFamily: "bai",
      fill: 0xffffff,
      fontSize: 100,
    },
  });
  title.anchor.set(0.5);
  title.zIndex = 999;
  app.stage.sortableChildren = true;
  app.stage.addChild(title);

  // 布局函数：标题居中 + 通知网格重排
  function eLayout() {
    title.x = app.screen.width / 2;
    title.y = app.screen.height / 2;
    relayoutProjects();
  }

  eLayout();
  app.renderer.on("resize", eLayout);
})();
