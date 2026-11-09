# customer-education-workshops

Public demos for customer education workshops. Each top-level folder is a standalone app — `cd` into it and install there. Demos do not share lockfiles or UI.

## Demos

| Folder | What | Run |
| --- | --- | --- |
| [`ledgerly/`](ledgerly/) | Fictional B2B billing ops (Fieldnote). Grok Build workshop app. | `cd ledgerly && npm i && npx prisma generate && npx prisma db seed && npm run dev` → [http://localhost:43173](http://localhost:43173) |

See [`ledgerly/README.md`](ledgerly/README.md) for workshop setup and [`ledgerly/PRESENTER.md`](ledgerly/PRESENTER.md) to present.

## License

Apache License, Version 2.0. External contributions are not accepted — see [`CONTRIBUTING.md`](CONTRIBUTING.md).
