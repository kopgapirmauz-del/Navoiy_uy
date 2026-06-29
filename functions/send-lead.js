const BOT_TOKEN = '8998665332:AAGMSl7msbGtRAXX_-ssa-6Sd4q7EorgmlM';
const CHAT_IDS = ['7856944337', '7532136561'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function onRequestPost({ request }) {
  const formData = await request.formData();

  if (String(formData.get('website') || '').trim() !== '') {
    return json({ ok: true });
  }

  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const payment = String(formData.get('payment') || '').trim();

  if (name.length < 2 || phone.length < 7 || !['Naqd', "Bo'lib to'lash"].includes(payment)) {
    return json({ ok: false, message: "Iltimos, ism, telefon va to'lov turini to'g'ri kiriting." }, 422);
  }

  const message = `🏡 <b>Yangi uy xaridori</b>\n\n`
    + `👤 <b>Ism:</b> ${escapeHtml(name)}\n`
    + `📞 <b>Telefon:</b> ${escapeHtml(phone)}\n`
    + `💳 <b>To'lov turi:</b> ${escapeHtml(payment)}\n`
    + `🕒 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`;

  for (const chatId of CHAT_IDS) {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });

    const result = await telegramResponse.json().catch(() => null);
    if (!telegramResponse.ok || result?.ok !== true) {
      return json({ ok: false, message: 'Telegramga yuborishda xatolik yuz berdi.' }, 502);
    }
  }

  return json({ ok: true });
}

export function onRequest() {
  return json({ ok: false, message: "Faqat POST so'rov qabul qilinadi." }, 405);
}
