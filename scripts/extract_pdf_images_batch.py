#!/usr/bin/env python3
"""
批量提取目录中所有 PDF 的嵌入图片（原始字节，不重编码）。

用法:
  python scripts/extract_pdf_images_batch.py \
    --input-dir "./pdfs" \
    --output-dir "./pdf-images"

依赖:
  pip install PyMuPDF
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys


def _safe_stem(path: Path) -> str:
    # 仅替换高风险路径字符，保留中文和空格，便于人工识别
    return "".join("_" if c in '<>:"/\\|?*' else c for c in path.stem).strip() or "untitled"


def extract_one_pdf(pdf_path: Path, output_root: Path, dedupe_xref: bool = True) -> tuple[int, int]:
    import fitz  # PyMuPDF

    doc = fitz.open(pdf_path)
    pdf_stem = _safe_stem(pdf_path)
    pdf_out_dir = output_root / pdf_stem
    pdf_out_dir.mkdir(parents=True, exist_ok=True)

    exported = 0
    seen_xrefs: set[int] = set()

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        images = page.get_images(full=True)

        for img_idx, img in enumerate(images, start=1):
            xref = img[0]
            if dedupe_xref and xref in seen_xrefs:
                continue

            try:
                data = doc.extract_image(xref)
            except Exception as e:
                print(f"  [WARN] {pdf_path.name} 第{page_idx + 1}页 图{img_idx} 提取失败: {e}")
                continue

            if not data or "image" not in data:
                continue

            image_bytes = data["image"]
            ext = data.get("ext", "bin")

            # 命名规则: PDF名_p页码_i序号_xref.ext
            filename = f"{pdf_stem}_p{page_idx + 1:03d}_i{img_idx:03d}_x{xref}.{ext}"
            out_path = pdf_out_dir / filename
            out_path.write_bytes(image_bytes)

            exported += 1
            seen_xrefs.add(xref)

    doc.close()
    return len(doc), exported


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="批量导出 PDF 原图到各自文件夹")
    parser.add_argument("--input-dir", required=True, type=Path, help="PDF 文件夹路径")
    parser.add_argument("--output-dir", required=True, type=Path, help="导出目录路径")
    parser.add_argument(
        "--keep-duplicates",
        action="store_true",
        help="默认会按 xref 去重；加上此参数会保留重复图片（同图在多页重复出现也导出）",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_dir: Path = args.input_dir
    output_dir: Path = args.output_dir

    if not input_dir.exists() or not input_dir.is_dir():
        print(f"[ERROR] 输入目录不存在或不是文件夹: {input_dir}")
        return 1

    pdf_files = sorted([p for p in input_dir.iterdir() if p.is_file() and p.suffix.lower() == ".pdf"])

    if not pdf_files:
        print(f"[ERROR] 在目录中未找到 PDF: {input_dir}")
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"找到 {len(pdf_files)} 个 PDF，开始导出图片...")
    total_pages = 0
    total_images = 0

    for idx, pdf in enumerate(pdf_files, start=1):
        print(f"[{idx}/{len(pdf_files)}] {pdf.name}")
        try:
            pages, images = extract_one_pdf(
                pdf_path=pdf,
                output_root=output_dir,
                dedupe_xref=not args.keep_duplicates,
            )
            print(f"  完成: {pages} 页, {images} 张图")
            total_pages += pages
            total_images += images
        except ImportError:
            print("[ERROR] 缺少依赖 PyMuPDF，请先安装: pip install PyMuPDF")
            return 2
        except Exception as e:
            print(f"  [ERROR] 处理失败: {e}")

    print("\n全部处理完成")
    print(f"PDF 数量: {len(pdf_files)}")
    print(f"总页数: {total_pages}")
    print(f"导出图片: {total_images}")
    print(f"输出目录: {output_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
