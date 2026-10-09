
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import styles from "./RainbowAsciiMatrix.module.css";

// 单元类型
interface BaseCell {
  id: string;
  row: number;
  col: number;
}

interface ColorCell extends BaseCell {
  type: "color";
  color: string;
  opacity: number;
}

interface AsciiCell extends BaseCell {
  type: "ascii";
  character: string;
  color: string;
  fontSize: number;
  fontWeight: number;
}

type MatrixCell = ColorCell | AsciiCell;

// 将数字限制在 0～1
const clamp01 = (value: number): number =>
  Math.max(0, Math.min(1, value));

// 线性插值
const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

// 平滑渐变
const smoothstep = (t: number): number =>
  t * t * (3 - 2 * t);

/**
 * 彩虹色块和 ASCII 字符矩阵的配置参数
 */
interface RainbowAsciiMatrixProps {
  cols?: number;         // 列数
  rows?: number;         // 行数
  gap?: number;          // 色块间距
  minFontSize?: number;  // ASCII 最小字号
  maxFontSize?: number;  // ASCII 最大字号
}

export default function RainbowAsciiMatrix({
  cols: customCols,
  rows: customRows,
  gap = 4,
  minFontSize = 8,
  maxFontSize = 36,
}: RainbowAsciiMatrixProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  // 当前容器尺寸
  const [size, setSize] = useState({
    width: 1440,
    height: 900,
  });

  // ===== 响应式尺寸检测 =====
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // ===== 根据窗口计算矩阵密度 =====

// 每个网格单元的目标尺寸,调小 cellSize 可增加色块数量
const cellSize = 42;

// 优先使用外部传入的行列数
// 没有传入时，根据窗口尺寸自动计算
const cols =
  customCols ??
  Math.max(2, Math.ceil(size.width / cellSize));

const rows =
  customRows ??
  Math.max(2, Math.ceil(size.height / cellSize));


  // ASCII 字符集合
  const asciiChars =
    ".:;+=*#%@&ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const cells = useMemo<MatrixCell[]>(() => {
    const result: MatrixCell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 使用网格中心坐标，更精确地划分对角线
        const x = (col + 0.5) / cols;
        const y = (row + 0.5) / rows;

        // 对角线：从右上角到左下角
        const d = x + y;

        const id = `${row}-${col}`;

        // ===== 左上彩虹矩阵 =====
        if (d < 0.98) {
          const fade = Math.pow(clamp01(d), 1.4);

          // 彩虹色相
          const hue = (x * 285 + y * 75) % 360;

          // 颜色越接近对角线越淡
          const saturation = lerp(94, 8, fade);
          const opacity = lerp(1, 0.12, fade);

          result.push({
            id,
            row,
            col,
            type: "color",
            color: `hsl(${hue}, ${saturation}%, 59%)`,
            opacity,
          });

          continue;
        }

        // ===== 右下 ASCII 矩阵 =====
        if (d > 1.02) {
          // 0：对角线附近，1：右下角
          const progress = clamp01(d - 1);
          const smooth = smoothstep(progress);

          // 灰度：浅灰 → 深黑
          const gray = Math.round(
            lerp(190, 25, progress)
          );

          // 字号：小 → 大
          const fontSize = lerp(minFontSize, maxFontSize, smooth);

          // 字重：细 → 粗
          const fontWeight =
            Math.round(lerp(200, 900, progress) / 100) * 100;

          // 固定字符序列，防止重新渲染时跳动
          const index =
            (row * 17 + col * 13) % asciiChars.length;

          result.push({
            id,
            row,
            col,
            type: "ascii",
            character: asciiChars[index],
            color: `rgb(${gray}, ${gray}, ${gray})`,
            fontSize,
            fontWeight,
          });
        }
      }
    }

    return result;
  }, [cols, rows, minFontSize, maxFontSize]);

  return (
    <main ref={containerRef} className={styles.page}>
      <div className={styles.composition}>
        {/* 左上标题 */}
        <div
          className={`${styles.headingGroup} ${styles.chromaHeading}`}
        >
          <span className={styles.eyebrow}>
            01 / COLOR SYSTEM
          </span>

          <h1 className={`${styles.displayTitle} ${styles.chromaText}`}>
            Chroma
          </h1>

          <div className={styles.headingRule} />

          <span className={styles.descriptor}>
            SPECTRUM / SATURATION / LIGHT
          </span>
        </div>

        {/* 右下标题 */}
        <div
          className={`${styles.headingGroup} ${styles.typefaceHeading}`}
        >
          <span className={styles.eyebrow}>
            02 / TYPE SYSTEM
          </span>

          <h2 className={`${styles.displayTitle} ${styles.typefaceText}`}>
            Typeface
          </h2>

          <div className={styles.headingRule} />

          <span className={styles.descriptor}>
            WEIGHT / FORM / CONTRAST
          </span>
        </div>

        {/* 全屏矩阵 */}
        <div
          className={styles.matrix}
          style={
            {
              "--cols": cols,
              "--rows": rows,
              "--gap": `${gap}px`,
            } as CSSProperties
          }
        >
          {cells.map((cell) => {
            const position: CSSProperties = {
              gridColumn: cell.col + 1,
              gridRow: cell.row + 1,
            };

            if (cell.type === "color") {
              return (
                <div
                  key={cell.id}
                  className={styles.colorBlock}
                  style={{
                    ...position,
                    backgroundColor: cell.color,
                    opacity: cell.opacity,
                  }}
                />
              );
            }

            return (
              <div
                key={cell.id}
                className={styles.asciiCell}
                style={position}
              >
                <span
                  className={styles.asciiChar}
                  style={{
                    fontSize: `${cell.fontSize}px`,
                    fontWeight: cell.fontWeight,
                    color: cell.color,
                  }}
                >
                  {cell.character}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
