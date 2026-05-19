# E-Banks API

Simple banking API built with Node.js and Express.

The API stores account balances in memory and supports balance checks, deposits, withdrawals, transfers, and state reset.

## Requirements

- Node.js
- pnpm

## Installation

Install dependencies:

```bash
pnpm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Default value:

```env
PORT=3000
```

## Running the Project

Start the development server:

```bash
pnpm run dev
```

The API will be available at:

```txt
http://localhost:3000
```

## Running Tests

Run the test suite:

```bash
pnpm test
```

## Endpoints

### POST /reset

Resets the in-memory application state.

Response:

```txt
OK
```

### GET /balance

Returns the balance of an existing account.

Query params:

```txt
account_id=100
```

Example:

```bash
curl "http://localhost:3000/balance?account_id=100"
```

If the account does not exist, the API returns:

```txt
404
0
```

### POST /event

Processes banking events.

#### Deposit

```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d '{"type":"deposit","destination":"100","amount":10}'
```

#### Withdraw

```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d '{"type":"withdraw","origin":"100","amount":5}'
```

#### Transfer

```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d '{"type":"transfer","origin":"100","destination":"200","amount":5}'
```

## Technical Decisions

- Business logic is kept separate from the HTTP layer.
- Controllers handle HTTP requests and responses.
- The service layer handles banking rules.
- The repository stores account state in memory using a `Map`.
- Tests cover both service rules and complete HTTP flows.
