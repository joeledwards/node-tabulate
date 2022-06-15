# tabulate

Reads a data file then outputs a sample table to the terminal.

## Installation

```shell
$ npm install @buzuli/tabulate
```

## Usage

```shell
$ tabulate my-file.csv
```

## Output

Given a CSV file with the contents:
```
"name","phone"
"bob","800.555.1111"
"jess","505.555.2222"
```

A table will be rendered in the terminal thus:
```
┌──────┬──────────────┐
│ name │ phone        │
├──────┼──────────────┤
│ bob  │ 800.555.1111 │
├──────┼──────────────┤
│ jess │ 505.555.2222 │
└──────┴──────────────┘
```
