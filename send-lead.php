<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Faqat POST so\'rov qabul qilinadi.']);
    exit;
}

if (!empty($_POST['website'] ?? '')) {
    echo json_encode(['ok' => true]);
    exit;
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Telegram sozlamalari topilmadi. config.php faylini yarating.']);
    exit;
}

$config = require $configPath;
$botToken = trim((string)($config['bot_token'] ?? ''));
$chatIds = array_values(array_filter(array_map('trim', array_map('strval', $config['chat_ids'] ?? []))));

if ($botToken === '' || $chatIds === []) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Telegram bot token yoki chat ID kiritilmagan.']);
    exit;
}

$name = trim((string)($_POST['name'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$payment = trim((string)($_POST['payment'] ?? ''));

if (mb_strlen($name) < 2 || mb_strlen($phone) < 7 || !in_array($payment, ['Naqd', 'Bo\'lib to\'lash'], true)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Iltimos, ism, telefon va to\'lov turini to\'g\'ri kiriting.']);
    exit;
}

$safeName = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$safePayment = htmlspecialchars($payment, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$time = date('Y-m-d H:i:s');

$message = "🏡 <b>Yangi uy xaridori</b>\n\n"
    . "👤 <b>Ism:</b> {$safeName}\n"
    . "📞 <b>Telefon:</b> {$safePhone}\n"
    . "💳 <b>To'lov turi:</b> {$safePayment}\n"
    . "🕒 <b>Vaqt:</b> {$time}";

foreach ($chatIds as $chatId) {
    $payload = http_build_query([
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML',
    ]);

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
            'timeout' => 12,
        ],
    ]);

    $result = @file_get_contents("https://api.telegram.org/bot{$botToken}/sendMessage", false, $context);
    $decoded = $result ? json_decode($result, true) : null;

    if (!is_array($decoded) || ($decoded['ok'] ?? false) !== true) {
        http_response_code(502);
        echo json_encode(['ok' => false, 'message' => 'Telegramga yuborishda xatolik yuz berdi.']);
        exit;
    }
}

echo json_encode(['ok' => true]);
