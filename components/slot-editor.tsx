"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Icon } from "@/components/icon";
import { type BannerSlot } from "@/lib/data";

type Props = {
  image: string;
  width: number;
  height: number;
  headline: BannerSlot;
  subtitle: BannerSlot;
  onChange: (next: { headline: BannerSlot; subtitle: BannerSlot }) => void;
  onReset: () => void;
};

type SlotKey = "headline" | "subtitle";

export function SlotEditor({
  image,
  width,
  height,
  headline,
  subtitle,
  onChange,
  onReset,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<SlotKey | null>(null);
  const dragStart = useRef<{ mx: number; my: number; top: number; left: number }>({
    mx: 0,
    my: 0,
    top: 0,
    left: 0,
  });
  const [selected, setSelected] = useState<SlotKey>("headline");
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const aspect = height > 0 ? width / height : 3;

  // 컨테이너 실제 픽셀 크기 측정 — 폰트 비율 미리보기에 사용
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) {
        setContainerSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const previewShortEdge = Math.min(containerSize.w, containerSize.h);

  function startDrag(key: SlotKey, e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const slot = key === "headline" ? headline : subtitle;
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      top: slot.top,
      left: slot.left,
    };
    setDragging(key);
    setSelected(key);
  }

  useEffect(() => {
    if (!dragging) return;
    function onMove(e: globalThis.MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const newLeft = clamp(dragStart.current.left + (dx / rect.width) * 100, 0, 100);
      const newTop = clamp(dragStart.current.top + (dy / rect.height) * 100, 0, 100);
      if (dragging === "headline") {
        onChange({ headline: { ...headline, top: newTop, left: newLeft }, subtitle });
      } else {
        onChange({ headline, subtitle: { ...subtitle, top: newTop, left: newLeft } });
      }
    }
    function onUp() {
      setDragging(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, headline, subtitle, onChange]);

  function updateSelected(patch: Partial<BannerSlot>) {
    if (selected === "headline") {
      onChange({ headline: { ...headline, ...patch }, subtitle });
    } else {
      onChange({ headline, subtitle: { ...subtitle, ...patch } });
    }
  }

  const slot = selected === "headline" ? headline : subtitle;

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <label className="text-label-caps text-on-surface-variant">텍스트 슬롯 위치</label>
        <button
          type="button"
          onClick={onReset}
          className="text-label-sm text-secondary hover:text-primary flex items-center gap-xs"
        >
          <Icon name="restart_alt" className="text-[14px]" />
          기본 위치로 리셋
        </button>
      </div>

      <p className="text-label-sm text-secondary">
        박스를 드래그해서 위치를 옮길 수 있어요. 아래에서 세부 값(폰트 크기·정렬·기본 문구)을 조정합니다.
      </p>

      {/* 슬롯 편집 영역 */}
      <div
        className="bg-surface-container-low rounded-xl border border-outline-variant p-md flex items-center justify-center"
        style={{ userSelect: dragging ? "none" : undefined }}
      >
        <div className="w-full max-w-full">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg card-shadow"
            style={{ aspectRatio: `${aspect}`, backgroundColor: "#1a1a1a" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <SlotBox
              kind="headline"
              slot={headline}
              selected={selected === "headline"}
              onMouseDown={(e) => startDrag("headline", e)}
              onClick={() => setSelected("headline")}
              previewShortEdge={previewShortEdge}
            />
            <SlotBox
              kind="subtitle"
              slot={subtitle}
              selected={selected === "subtitle"}
              onMouseDown={(e) => startDrag("subtitle", e)}
              onClick={() => setSelected("subtitle")}
              previewShortEdge={previewShortEdge}
            />
          </div>
        </div>
      </div>

      {/* 슬롯 선택 탭 */}
      <div className="flex bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
        {(["headline", "subtitle"] as SlotKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSelected(k)}
            className={
              "flex-1 py-sm text-label-sm font-semibold transition-colors " +
              (selected === k
                ? "bg-primary text-on-primary"
                : "text-secondary hover:bg-surface-container")
            }
          >
            {k === "headline" ? "헤드라인" : "부제목"}
          </button>
        ))}
      </div>

      {/* 선택된 슬롯의 세부 설정 */}
      <div className="bg-surface-container-low rounded-xl p-md space-y-md border border-outline-variant/40">
        <div className="space-y-xs">
          <label className="text-label-sm text-on-surface-variant" htmlFor="slot-default">
            기본 표시 문구
          </label>
          <input
            id="slot-default"
            type="text"
            value={slot.defaultText}
            onChange={(e) => updateSelected({ defaultText: e.target.value })}
            placeholder="사용자에게 처음 보여줄 문구"
            className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-base bg-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-sm">
          <NumberField
            label="상단 %"
            value={slot.top}
            onChange={(v) => updateSelected({ top: clamp(v, 0, 100) })}
          />
          <NumberField
            label="좌측 %"
            value={slot.left}
            onChange={(v) => updateSelected({ left: clamp(v, 0, 100) })}
          />
          <NumberField
            label="너비 %"
            value={slot.width}
            onChange={(v) => updateSelected({ width: clamp(v, 5, 100) })}
            min={5}
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-sm text-on-surface-variant flex items-center justify-between">
            <span>폰트 크기 (짧은 변 대비)</span>
            <span className="text-secondary font-mono">
              {(slot.fontScale * 100).toFixed(1)}% · {Math.round(slot.fontScale * Math.min(width, height))}px
            </span>
          </label>
          <input
            type="range"
            min={2}
            max={35}
            step={0.5}
            value={slot.fontScale * 100}
            onChange={(e) => updateSelected({ fontScale: parseFloat(e.target.value) / 100 })}
            className="w-full accent-primary"
          />
        </div>

        <div className="space-y-xs">
          <label className="text-label-sm text-on-surface-variant">정렬</label>
          <div className="flex bg-white border border-outline-variant rounded-lg overflow-hidden">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => updateSelected({ align: a })}
                className={
                  "flex-1 py-sm transition-colors " +
                  (slot.align === a
                    ? "bg-primary text-on-primary"
                    : "text-secondary hover:bg-surface-container-low")
                }
              >
                <Icon
                  name={
                    a === "left"
                      ? "format_align_left"
                      : a === "center"
                        ? "format_align_center"
                        : "format_align_right"
                  }
                  className="text-[18px]"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlotBox({
  kind,
  slot,
  selected,
  onMouseDown,
  onClick,
  previewShortEdge,
}: {
  kind: SlotKey;
  slot: BannerSlot;
  selected: boolean;
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
  onClick: () => void;
  previewShortEdge: number;
}) {
  const label = kind === "headline" ? "헤드라인" : "부제목";
  const fontPx = Math.max(8, slot.fontScale * previewShortEdge);

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        position: "absolute",
        top: `${slot.top}%`,
        left: `${slot.left}%`,
        width: `${slot.width}%`,
        textAlign: slot.align,
        cursor: "grab",
        lineHeight: kind === "headline" ? 1.15 : 1.4,
      }}
      className={
        "select-none transition-all " +
        (selected
          ? "outline outline-2 outline-primary outline-offset-[1px] ring-4 ring-primary/20"
          : "outline outline-1 outline-dashed outline-white/70 hover:outline-white")
      }
    >
      {/* 떠있는 라벨 칩 — 상단 근처면 아래쪽으로 표시 */}
      <div
        className={
          "absolute flex items-center gap-[3px] px-[6px] py-[2px] rounded text-[9px] uppercase tracking-wider font-bold whitespace-nowrap pointer-events-none " +
          (slot.top < 8 ? "top-full mt-[3px] " : "bottom-full mb-[3px] ") +
          (selected
            ? "bg-primary text-on-primary"
            : "bg-white/90 text-on-surface")
        }
        style={{ left: 0 }}
      >
        <Icon name="drag_indicator" className="text-[11px]" />
        <span>{label}</span>
      </div>

      {/* 실제 텍스트 — 박스 외곽이 곧 텍스트 영역 */}
      <div
        className="text-white font-semibold"
        style={{
          fontSize: `${fontPx}px`,
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          opacity: 0.95,
          wordBreak: "keep-all",
        }}
      >
        {slot.defaultText || (kind === "headline" ? "헤드라인 예시" : "부제목 예시")}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-xs">
      <label className="text-label-sm text-on-surface-variant">{label}</label>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-full px-sm py-xs border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-body-sm bg-white"
      />
    </div>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
