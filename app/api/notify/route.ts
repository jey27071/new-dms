// 이메일 알림 API 라우트 (Resend)
// 요청 생성·담당자 배정·상태 변경 시 호출됨

import { NextRequest } from "next/server";
import { Resend } from "resend";

type Body =
  | {
      type: "request_created";
      requestId: string;
      title: string;
      description?: string;
      requestType: string;
      category?: string;
      deadline?: string;
      requesterEmail: string;
      requesterName?: string;
    }
  | {
      type: "request_assigned";
      requestId: string;
      title: string;
      assigneeEmail: string;
      assigneeName?: string;
      requesterEmail: string;
      requesterName?: string;
    }
  | {
      type: "status_changed";
      requestId: string;
      title: string;
      from: string;
      to: string;
      note?: string;
      requesterEmail: string;
      requesterName?: string;
      actorEmail: string;
    };

const STATUS_LABEL: Record<string, string> = {
  review: "검토 중",
  in_progress: "진행 중",
  completed: "완료됨",
  rejected: "반려됨",
};

const TYPE_LABEL: Record<string, string> = {
  guide_inquiry: "가이드 문의",
  asset_create: "에셋 제작",
  production: "현장 프로덕션",
  other: "기타",
};

function getOrigin(req: NextRequest): string {
  const fwdHost = req.headers.get("x-forwarded-host");
  const fwdProto = req.headers.get("x-forwarded-proto");
  const host = fwdHost ?? req.headers.get("host") ?? new URL(req.url).host;
  const proto = fwdProto ?? "https";
  return `${proto}://${host}`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailShell(opts: {
  preheader: string;
  title: string;
  intro: string;
  rows: { label: string; value: string }[];
  noteHtml?: string;
  cta: { href: string; label: string };
}): string {
  const rowsHtml = opts.rows
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 0;color:#777587;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;width:100px;vertical-align:top;">${escape(r.label)}</td>
        <td style="padding:8px 0;color:#1b1b24;font-size:14px;vertical-align:top;">${escape(r.value)}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#fcf8ff;font-family:-apple-system,BlinkMacSystemFont,'Pretendard','Segoe UI',Roboto,sans-serif;color:#1b1b24;">
<span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escape(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fcf8ff;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(30,27,75,0.05),0 4px 6px -2px rgba(30,27,75,0.03);overflow:hidden;">
      <tr><td style="padding:24px 32px 0 32px;">
        <div style="display:inline-block;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#1b1b24;line-height:1;">SDMS</div>
        <div style="font-size:11px;color:#777587;margin-top:2px;letter-spacing:0.05em;text-transform:uppercase;">Design Management System</div>
      </td></tr>
      <tr><td style="padding:16px 32px 8px 32px;">
        <h1 style="margin:0;font-size:20px;font-weight:600;color:#1b1b24;letter-spacing:-0.01em;">${escape(opts.title)}</h1>
      </td></tr>
      <tr><td style="padding:0 32px 16px 32px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#464555;">${opts.intro}</p>
      </td></tr>
      <tr><td style="padding:0 32px 8px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e1ee;border-bottom:1px solid #e4e1ee;margin:8px 0;">
          ${rowsHtml}
        </table>
      </td></tr>
      ${
        opts.noteHtml
          ? `<tr><td style="padding:8px 32px 16px 32px;">
              <div style="background:#f5f2ff;border:1px solid #e4e1ee;border-radius:8px;padding:12px 16px;font-size:13px;color:#464555;line-height:1.5;">${opts.noteHtml}</div>
            </td></tr>`
          : ""
      }
      <tr><td align="left" style="padding:16px 32px 32px 32px;">
        <a href="${escape(opts.cta.href)}" style="display:inline-block;background:#3525cd;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
          ${escape(opts.cta.label)}
        </a>
      </td></tr>
      <tr><td style="padding:0 32px 24px 32px;border-top:1px solid #e4e1ee;">
        <p style="margin:16px 0 0 0;font-size:11px;color:#777587;line-height:1.5;">
          이 메일은 SDMS 시스템에서 자동 발송되었습니다. 회신은 처리되지 않습니다.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;

  if (!apiKey || !from) {
    return Response.json(
      { ok: false, error: "Resend가 설정되지 않았습니다 (RESEND_API_KEY/RESEND_FROM)." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "잘못된 요청" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  const origin = getOrigin(req);

  try {
    if (body.type === "request_created") {
      // 새 요청 등록 — 관리자에게 알림 (ADMIN_NOTIFY_EMAIL)
      if (!adminEmail) {
        return Response.json(
          { ok: false, error: "ADMIN_NOTIFY_EMAIL 환경변수가 없습니다." },
          { status: 200 }, // 200 — 알림 실패해도 요청 자체는 OK
        );
      }
      const html = emailShell({
        preheader: `새 요청: ${body.title}`,
        title: "새 디자인 요청이 등록되었습니다",
        intro: `${escape(body.requesterName ?? body.requesterEmail)}님이 새 요청을 제출했습니다. 관리자 콘솔에서 검토·배정해주세요.`,
        rows: [
          { label: "요청 ID", value: body.requestId },
          { label: "제목", value: body.title },
          { label: "유형", value: TYPE_LABEL[body.requestType] ?? body.requestType },
          ...(body.category ? [{ label: "카테고리", value: body.category }] : []),
          ...(body.deadline ? [{ label: "마감일", value: body.deadline }] : []),
          { label: "요청자", value: `${body.requesterName ?? ""} <${body.requesterEmail}>`.trim() },
        ],
        noteHtml: body.description ? escape(body.description).replace(/\n/g, "<br>") : undefined,
        cta: {
          href: `${origin}/admin/requests/${body.requestId}`,
          label: "관리자 콘솔에서 확인",
        },
      });
      const result = await resend.emails.send({
        from,
        to: adminEmail,
        subject: `[SDMS] 새 요청 · ${body.title}`,
        html,
      });
      return Response.json({ ok: true, id: result.data?.id });
    }

    if (body.type === "request_assigned") {
      const html = emailShell({
        preheader: `담당 요청 배정: ${body.title}`,
        title: "디자인 요청에 담당자로 배정되었습니다",
        intro: `${escape(body.requesterName ?? body.requesterEmail)}님의 디자인 요청 처리에 배정되었습니다.`,
        rows: [
          { label: "요청 ID", value: body.requestId },
          { label: "제목", value: body.title },
          { label: "요청자", value: `${body.requesterName ?? ""} <${body.requesterEmail}>`.trim() },
        ],
        cta: {
          href: `${origin}/admin/requests/${body.requestId}`,
          label: "요청 상세 보기",
        },
      });
      const result = await resend.emails.send({
        from,
        to: body.assigneeEmail,
        subject: `[SDMS] 담당 배정 · ${body.title}`,
        html,
      });
      return Response.json({ ok: true, id: result.data?.id });
    }

    if (body.type === "status_changed") {
      const fromLabel = STATUS_LABEL[body.from] ?? body.from;
      const toLabel = STATUS_LABEL[body.to] ?? body.to;
      const html = emailShell({
        preheader: `상태 변경: ${fromLabel} → ${toLabel}`,
        title: "디자인 요청 상태가 변경되었습니다",
        intro: `귀하가 제출한 요청의 상태가 <strong>${escape(fromLabel)}</strong> → <strong>${escape(toLabel)}</strong> 으로 변경되었습니다.`,
        rows: [
          { label: "요청 ID", value: body.requestId },
          { label: "제목", value: body.title },
          { label: "변경자", value: body.actorEmail },
        ],
        noteHtml: body.note ? escape(body.note).replace(/\n/g, "<br>") : undefined,
        cta: {
          href: `${origin}/my-requests/${body.requestId}`,
          label: "요청 상세 보기",
        },
      });
      const result = await resend.emails.send({
        from,
        to: body.requesterEmail,
        subject: `[SDMS] 상태 변경 · ${body.title}`,
        html,
      });
      return Response.json({ ok: true, id: result.data?.id });
    }

    return Response.json({ ok: false, error: "알 수 없는 알림 타입" }, { status: 400 });
  } catch (err) {
    console.error("[/api/notify]", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
