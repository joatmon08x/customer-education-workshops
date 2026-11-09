# Ledgerly

Workshop app for Grok Build. Catalog is Starter **$49**, Growth **$99**, Scale **$249**. Synthetic data only. No real companies.

Presenter notes: [`PRESENTER.md`](PRESENTER.md).

## Before the workshop

Install Node.js 20, clone the repository, and run Ledgerly. You don't need Python, Docker, Postgres, or an `.env` file.

### Requirements

- Node.js 20
- npm (included with Node.js)

### Install Node.js 20

After you install Node.js, confirm the version:

```bash
node -v
```

The output is `v20.x.x`.

#### macOS

Install the `.pkg` from [Node.js 20 downloads](https://nodejs.org/dist/latest-v20.x/). To install with nvm:

```bash
nvm install 20
nvm use 20
```

#### Windows

Install the `.msi` from [Node.js 20 downloads](https://nodejs.org/dist/latest-v20.x/). To install with winget, run this command in PowerShell:

```powershell
winget install --id OpenJS.NodeJS.20 --exact
```

Close and reopen PowerShell. Then run `node -v`.

#### WSL

In WSL, run:

```bash
nvm install 20
nvm use 20
```

Clone the project under your Linux home directory, not under `/mnt/c`.

### Clone and run Ledgerly

1. Clone the repository, install dependencies, and start the app:

   ```bash
   git clone https://github.com/xai-org/customer-education-workshops.git
   cd customer-education-workshops/ledgerly
   npm i
   npx prisma generate
   npx prisma db seed
   npm run dev
   ```

2. Open [http://localhost:43173](http://localhost:43173).

Keep the terminal open while you use the app. To stop the server, press **Ctrl+C**.

### Confirm setup

Run:

```bash
npm test
```

Expected result:

```text
1 failed / 33 passed
```

The failing test is part of the workshop. It doesn't mean setup failed.

### Troubleshoot

| Problem | What to do |
| --- | --- |
| Empty dashboard | Run `npm run db:reset`. |
| Missing Prisma client | Run `npx prisma generate`, then `npx prisma db seed`. |
| Port 43173 already in use | Stop the previous development server. |
| Slow or broken WSL setup | Keep the project under `~/customer-education-workshops`, not `/mnt/c`. |

If you can't open http://localhost:43173, contact the workshop organizers.
