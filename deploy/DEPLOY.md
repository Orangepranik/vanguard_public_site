# Деплой VANGUARD (Ubuntu + Docker + Caddy)

Стек: **PostgreSQL** + **Next.js-сайт** + **Caddy** (реверс-проксі з автоматичним HTTPS).
Домен: **ursvanguard.com** → сертифікат Let's Encrypt Caddy отримує сам.

Сайт **збирається без БД** (порожні сторінки), а реальний каталог підтягується вже в
рантаймі через ISR — тому Docker-збірка не потребує доступу до бази.

---

## 0. Що зробити ДО деплою (робить власник)

1. **DNS** — у реєстратора домену `ursvanguard.com` створити A-записи на IP сервера:
   ```
   @     A   169.58.92.166
   www   A   169.58.92.166      # або CNAME www → ursvanguard.com
   ```
   Перевірити поширення: `dig +short ursvanguard.com` має повернути `169.58.92.166`.
2. **Порти 80 і 443** — відкрити на сервері (firewall / панель провайдера). Потрібні Caddy для HTTPS.
3. **Безпека** — див. розділ «Безпека» внизу (змінити root-пароль, додати SSH-ключ).

---

## 1. Підготувати сервер

Зайти по SSH і встановити Docker:
```
apt update && apt -y upgrade
curl -fsSL https://get.docker.com | sh
docker version && docker compose version
```

## 2. Отримати код на сервер
```
git clone <ВАШ_РЕПОЗИТОРІЙ> /opt/vanguard
cd /opt/vanguard
```
(приватний репозиторій — через deploy-ключ або HTTPS-токен)

## 3. Секрети
```
cp deploy/.env.production.example deploy/.env
nano deploy/.env
```
Заповнити `POSTGRES_PASSWORD`, `REVALIDATE_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## 4. Підняти базу і засідити каталог
```
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d db
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env --profile tools run --rm seed
```
`seed` застосує міграції та завантажить каталог (7 категорій, 8 продуктів, відгуки).

## 5. Зібрати й запустити сайт + Caddy
```
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
```
Caddy автоматично випустить TLS-сертифікат для `ursvanguard.com` (за коректних DNS і відкритих 80/443).
Статус: `docker compose -f deploy/docker-compose.prod.yml ps`, логи: `... logs -f caddy`.

## 6. Наповнити ISR-кеш реальними даними
Оскільки сайт зібрано без БД, після сіду оновлюємо кеш сторінок:
```
curl -X POST https://ursvanguard.com/api/revalidate \
  -H "x-revalidate-secret: <REVALIDATE_SECRET>" \
  -H "content-type: application/json" \
  -d '{"scope":"all"}'
```

## 7. Перевірка
- `https://ursvanguard.com` — головна
- `https://ursvanguard.com/catalog` — 8 продуктів
- заявка з `/contacts` → Telegram-сповіщення менеджеру

---

## Оновлення (нова версія сайту)
```
cd /opt/vanguard && git pull
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
# якщо змінювались дані каталогу (products.json тощо) — повторити крок 4 (тільки seed) і крок 6 (revalidate)
```

## Резервна копія БД
```
docker compose -f deploy/docker-compose.prod.yml exec db \
  pg_dump -U vanguard vanguard > backup-$(date +%F).sql
```

---

## Безпека (важливо)

- **Root-пароль було передано в переписці — його треба змінити** (`passwd`) і перейти на SSH-ключі:
  ```
  ssh-copy-id root@169.58.92.166        # з локальної машини
  # потім у /etc/ssh/sshd_config: PasswordAuthentication no ; systemctl restart ssh
  ```
- `deploy/.env` містить секрети — **ніколи не комітити** (він у `deploy/.gitignore`).
- Порт БД (5432) назовні не публікується — доступ лише всередині Docker-мережі.
