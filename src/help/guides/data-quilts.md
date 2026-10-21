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
**Layout** tab. Either way the quilt gets a **Data** tab.

The plan says how days are grouped.

| Plan   | Days are placed by                                                                       |
| ------ | ---------------------------------------------------------------------------------------- |
| Months | a block in each month's space, with places for days 1 to 31                              |
| Weeks  | a block in each week's space, with places for days 1 to 7, counted from the period start |
| Days   | numbering pieces with days of the year directly                                          |

The period is one year from **Period starts**. A Months period starts on the 1st of a month. A
period that holds 29 February has 366 days.

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

The built-in library has **Month Strip** blocks for 28, 29, 30, and 31 days (31 bars each, the days
past the month in black) and a **Week Row** of 7 bars, filed under **Data**.

## Place the months or weeks

In the **Data** tab, set **Where the days go** to **Months** (or **Weeks**) and tap the block
spaces in order: January, February, and so on. **Rows**, **Columns**, and **Snake** number every
block space at once. Tap a numbered space again to take its number back.

Under **Month blocks**, pick the blocks for 31, 30, 29, and 28-day months. Each numbered space shows
a block for its month's length. With more than one block for a length, each space gets one of them at
random, and **Shuffle** picks again. A length with no block uses the next longer one, and its extra
places show the filler or their own color, as set under **Places without data**.

**Year days** numbers pieces anywhere in the quilt with days of the year: every day in a Days plan,
or the days a Weeks plan leaves over (52 weeks are 364 days, so days 365 and 366 need a place of
their own, such as a cornerstone).

The tab lists anything that needs attention, such as a month on two spaces or days without a place.

## Map values to colors

Each value has a **Label** and a **Kind**. Temperature, Hours of daylight, and Rainfall map ranges
of numbers to colors. Mood maps each choice to a color. Custom starts with three number ranges.

A range holds values from its first number up to (not including) its second. A value past the first
or last range takes that end range's color. Change a range's numbers, color, or fabric, add or remove
ranges, and the quilt recolors as you go. **Add a value** adds B, C, and D.

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

With **Where the days go** on **Off**, tapping a day's piece opens its row. **Days without an entry**
sets what a day shows until it has a value: its own color, the sample value, or the filler.

## Print it

The printed quilt picture has a legend of each value's colors. Yardage can't know your data ahead of
time, so it counts a worst case. Each range or category counts its **most days expected**, each in
the largest piece of its value. Set those numbers under **Yardage: most days expected** in the
**Data** tab. Left empty, each takes its number of days in the sample.
