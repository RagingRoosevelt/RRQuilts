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
**Details** tab. Its **Design** tab then has three tabs in the tray.

| Tab    | What it holds                                                    |
| ------ | ---------------------------------------------------------------- |
| Blocks | the data block types and the numbered list of block spaces       |
| Colors | the usual colors and fabrics, for sashing, borders, and the rest |
| Data   | the period, the data, and the colors for each value              |

The plan says how days are grouped. Change it under **Data quilt** in the quilt's **Details** tab.

| Plan   | Each number stands for                                                                   |
| ------ | ---------------------------------------------------------------------------------------- |
| Months | a month, 12 numbers                                                                      |
| Weeks  | 7 days counted from the period start, 52 numbers, then one number for each day left over |
| Days   | one day, a number for every day of the period                                            |

With **Data quilt** on, the wizard's size step and the quilt's **Layout** tab say how many whole
block spaces the layout has and how many the plan needs. Blocks cut down at the quilt's edge don't
count, and they can't take a number.

The period is one year from **Period starts**. A Months period starts on the 1st of a month. A
period that holds 29 February has 366 days, so a Weeks plan then has two days left over.

## Make a data block

A data block is a block a data quilt places for each month, week, or day. Its pieces carry day
numerals that say which day colors them.

1. Make a block with **Data block** turned on in the new block window, or turn it on in a block's
   **Details** tab.
2. Pick its type under **Data block type**: **Day**, **Week**, or **Month**.
3. Draw it as usual in the **Draw** tab.
4. In the **Color** tab, open **Day numerals**. Drag a numeral onto a patch, or pick a numeral and
   tap patches. With **Next numeral after each tap** on, the next numeral is picked for you.

A month block has numerals 1 to 31, a week block 1 to 7, and a day block only 1. A numeral can go
on more than one patch, so one day can color several pieces. Tap a patch that has the picked
numeral to take it off. Numerals not on any patch yet show faded. **Clear all numerals** takes every numeral, of every value, off the drawing shown. A new variant
starts with its colors but no numerals. A numbered patch keeps the color
it had underneath. That color is what **As designed** shows.

**Value** picks A, B, C, or D. Use B, C, and D when a day records more than one value, such as a
high and a low temperature. Each value has its own numerals and its own order line. **Show
numerals** and **Show order line** draw the numerals and a line through the patches in order.

### Variants for shorter months and single days

A month block's own drawing is for 31 days. At the top of the **Draw** and **Color** tabs,
**Variant** adds a 30, 29, or 28-day variant, which starts as a copy of the 31-day drawing. Pick a
variant to draw and number it on its own. A month shows the variant with the fewest days that still
covers it: February takes the 28-day variant (the 29 in a leap year), and a 30-day month without a
30-day variant takes the 31. Places past a month's last day show the filler or their own color, as
set under **Places past a number’s days**.

Month and week blocks can also add a **1 day** variant. It stands for a single day, so it serves
the days a Weeks plan leaves over (365, and 366 in a leap year) and the days of a Days plan, and the
block is listed with the day blocks. Unless you pick a day block, the days left over in a Weeks plan
take the 1-day variant of the week block in use.

The built-in library has a **Month Strip** with 30, 29, and 28-day variants (31 bars each, the days
past the month in black), a **Week Row** of 7 bars, and a **Day Square** with one place, all filed
under **Data**.

To find data blocks, use the **Data** filter in the project's **Blocks** tab and in the libraries.
The project's **Quilts** tab can show only data quilts or only the others.

## Place the numbers

At the top of the **Blocks** tab, pick a block type. A Months plan lists month blocks, Weeks lists
week blocks and day blocks for the days left over, and Days lists day blocks.

The tab then lists every number of the plan. Months go by name (Jan, Feb, and so on from the period
start), weeks and days by number (001, 002, and on). With **Place numbers** on, tap block spaces on
the quilt. Each gets the highlighted number and the picked type, and the highlight moves on to the
next number not yet placed. Tap a number in the list to place from there. Numbers already placed are
skipped. Tap a placed space to take its number back, or pick another type first and tap it to change
its type.

**Fill empty numbers** puts every block space without a number on the empty numbers, by **Rows**,
**Columns**, or **Snake**, with the picked type. **Clear** takes every number back. A space whose
number is taken back is emptied.

Beside each label is a card for the block space holding it: an uncolored picture of its block and
the space's number, **Block 1**, **Block 2**, and so on, counted left to right and top to bottom.
Drag a card to another label, or use the arrows on it, and the cards between move along. The labels
stay where they are, so each moved block takes its new label, and the variant for its new month.
While you drag, the card's block space lights up on the quilt. The quilt shows every block space's
number, and each placed space's label under it, joined by a line in order. A lighter arrow inside
each placed block runs through its days in order.

The tab lists anything that needs attention, such as numbers not placed yet or days without a
place.

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
