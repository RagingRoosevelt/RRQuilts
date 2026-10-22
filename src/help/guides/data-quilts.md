---
title: Data quilts
order: 35
summary: Color a quilt from a year of data, such as daily temperatures or moods.
---

A **data quilt** colors each day's place from that day's value: a temperature, a mood, hours of
daylight, rainfall, or numbers and categories of your own. You design where each day goes and which
color each value gets. The app fills in the colors from the data.

## Make a data quilt

Start a quilt with **Data quilt** turned on in the first step of the wizard, and pick **12 months**,
**52 weeks**, or **365 days**. To make an existing quilt a data quilt, turn on **Data quilt** in its
**Layout** tab. Either way the quilt opens in the **Design** tab, where the tray has three tabs.

| Tab    | What it holds                                                    |
| ------ | ---------------------------------------------------------------- |
| Blocks | the numbered list of block spaces and the block pools            |
| Colors | the usual colors and fabrics, for sashing, borders, and the rest |
| Data   | the period, the data, and the colors for each value              |

The plan says how days are grouped. Change it under **Data quilt** in the **Layout** tab.

| Plan   | Each number stands for                                                                   |
| ------ | ---------------------------------------------------------------------------------------- |
| Months | a month, 12 numbers                                                                      |
| Weeks  | 7 days counted from the period start, 52 numbers, then one number for each day left over |
| Days   | one day, a number for every day of the period                                            |

The period is one year from **Period starts**. A Months period starts on the 1st of a month. A
period that holds 29 February has 366 days, so a Weeks plan then has two days left over.

## Number the places in a block

A data block is an ordinary block whose pieces are numbered as day places.

1. Open the block in the block editor and choose **Color**.
2. Open **Data places** and turn on **Number pieces**.
3. Pick **1 to 31** for a month block or **1 to 7** for a week block.
4. With **Paint**, tap pieces in order. Each gets the next free number. Tap a numbered piece again to
   take its number back.

To number many pieces at once, color them all one color first, then pick **Rows**, **Columns**, or
**Snake** under **Spray order** and tap one of them with **Spray**. Every piece of that color is
numbered in that order, starting from the next free number.

**Show numbers** and **Show order line** draw the numbers and a line through the pieces in order,
so a skipped or misplaced number shows. A numbered piece keeps the color it had. That color is what
**As designed** shows.

**Value** picks A, B, C, or D. Use B, C, and D when a day records more than one value, such as a
high and a low temperature. Each value has its own numbers and its own order line.

A block for a single day needs only one numbered piece.

The built-in library has **Month Strip** blocks for 28, 29, 30, and 31 days (31 bars each, the days
past the month in black), a **Week Row** of 7 bars, and a **Day Square** with one place, all filed
under **Data**.

## Place the numbers

The **Blocks** tab lists every number of the plan. Months go by name (Jan, Feb, and so on from the
period start), weeks and days by number (001, 002, and on). With **Place numbers** on, tap block spaces on the quilt. Each gets the highlighted
number, which then moves on to the next number not yet placed. Tap a number in the list to place from
there. Numbers already placed are skipped. Tap a placed space to take its number back.

**Fill empty numbers** puts every block space without a number on the empty numbers, by **Rows**,
**Columns**, or **Snake**. **Clear** takes every number back. A space whose number is taken back
is emptied of its pool block.

Beside each label is a card for the block space holding it: an uncolored picture of its block and
the space's number, **Block 1**, **Block 2**, and so on, counted left to right and top to bottom.
Drag a card to another label, or use the arrows on it, and the cards between move along. The labels
stay where they are, so each moved block takes its new label, and its picture changes to a block
from the new label's pool. While you drag, the card's block space lights up on the quilt. The quilt
shows every block space's number, and each placed space's label under it, joined by a line in
order. A lighter arrow inside each placed block runs through its days in order.

Each number shows a block from the pool for its days. A Months plan has pools for 31, 30, 29, and
28-day months, Weeks has a pool for weeks and one for the days left over, and Days has one pool. A
pool takes only blocks with at least that many day places, so January always draws from the 31-day
pool. With more than one block in a pool, each space gets one of them at random, and **Shuffle**
picks again. A block with more places than its number needs shows the filler or their own color in
the places past the last day, as set under **Places past a number’s days**.

The tab lists anything that needs attention, such as numbers not placed yet, a pool with no block,
or days without a place.

## Map values to colors

Each value has a **Label** and a **Kind**. Temperature, Hours of daylight, and Rainfall map ranges
of numbers to colors. Mood maps each choice to a color. Custom starts with three number ranges.

The values are in the **Data** tab, under a small chart of how many days of the sample fall in each
range or category. The first range holds every value under its end, and the last every value from
its start. A range between holds values from its first number up to (not including) its second.
Ranges stay joined, so changing where one ends moves where the next starts. Change a range's
numbers, color, or fabric, add or remove ranges, and the quilt recolors as you go. **Add a
value** adds B, C, and D.

In a colorway other than the primary, each range or category shows its primary color and what it
becomes in this colorway. Pick a replacement there. Show the primary colorway to change the values
themselves.

## Preview with sample data

**Sample data** shows the quilt colored by a made-up year, so you can judge the colors before your
own data comes in. Each value's **Sample** picks which made-up series feeds it. **CSV…** loads your
own sample instead: open a file or paste rows, then pick the date column and the column for each
value. A sample from another year is matched by day of the year.

## Enter real data

Switch **Show** to **Real data**. Then:

- **Table** lists every day of the period with a field for each value.
- **Today's entry** opens today's row.
- **Missing** lists days up to today without an entry.
- **Import** reads a CSV file or pasted rows into the table. Days already entered take the new values.

With the **Data** tab open, tapping a day's piece opens its row. **Days without an entry**
sets what a day shows until it has a value: its own color, the sample value, or the filler.

## Print it

The printed quilt picture has a legend of each value's colors. Yardage can't know your data ahead of
time, so it counts a worst case. Each range or category counts its **most days expected**, each in
the largest piece of its value. Set those numbers under **Yardage** › **Most days expected** in the
**Data** tab. Left empty, each takes its number of days in the sample.
