# Household Emergency Planner

A simple tool for working through your household emergency plan on the computer, then printing it or saving it as a PDF.

**Your answers stay on this computer.** Nothing is sent anywhere, and the planner works without the internet. Never upload a filled-in backup file to GitHub or any other website, because it contains your personal details.

## Opening the planner

You can use it from the web address or from a copy of the folder on your computer.

**From the web address**

1. Open Firefox or Chrome.
2. Go to **spr1ngw1ll0wtr33.github.io/HomeEmergencyPlan/planner/**
3. Bookmark the page (press **Ctrl** and **D** together) so you can find it again.

**From a copy on your computer**

1. Open the **planner** folder in the Files app.
2. Double-click **index.html**. It opens in your web browser.
3. Always open it the same way, in the same browser. Answers saved in Firefox do not appear in Chrome, and answers saved from the web address do not appear in the copy on your computer (and the other way round). If in doubt, use a backup file to move your answers.

## Filling it in

1. Choose a section from the list on the left, or press **Begin**.
2. Type your answers. They are saved on this computer as you type. The words under the title at the top say when they were last saved, for example "Saved on 16/11/2026 at 6:20 pm".
3. Type dates as dd/mm/yyyy, for example 16/11/2026.
4. In lists of people, pets, contacts and so on, press the **+ Add another…** button for a new row, and **Remove…** to delete a row.
5. To add your own item to a tick-box list, type it in the box under the list and press **Add item**.
6. To add your own question or note to any section, press **+ Add your own question or note** near the bottom of that section.
7. Use **Next** and **Previous** at the bottom of each section to move through. Sections with answers show a tick in the list on the left.

## Saving a backup

Do this whenever you finish a session.

1. Press **Save backup** at the top.
2. A file called something like **household-plan-backup-16-11-2026.json** goes into your **Downloads** folder. (If the browser asks, choose **Save File**.)
3. Copy the file somewhere safe, such as a USB stick. Keep more than one copy if you can.

## Opening a backup (to carry on later, or on another computer)

1. Open the planner.
2. Press **Open a saved file** at the top.
3. Find your backup file (usually in **Downloads**), click it once, then press **Open**.
4. If the planner already has answers in it, it asks before replacing them. Press **Yes, open the file** to carry on, or **Cancel** to keep what is there.

A part-finished backup opens fine; you simply carry on where you left off.

## Printing or saving as a PDF

1. Press **Produce final plan** at the bottom of the list on the left.
2. Check the preview. Each scenario starts on a new page.
3. If you want a paper template with lines to write on, tick **Show blank lines for unanswered questions**. Leave it unticked to print only what you have filled in.
4. Press **Print or save as PDF**.
5. In the Print window:
   - to print on paper, choose your printer;
   - to make a PDF, choose **Save to PDF** (Firefox) or **Save as PDF** (Chrome) as the printer or destination.
6. Check the paper size is **A4**, then press **Print** or **Save**.

## Starting again

1. Save a backup first (see above), just in case.
2. Press **Start again** at the top.
3. Read the message, then press **Delete my answers and start again**.

This only clears the planner's own answers on this computer. Your backup files and your other apps are not affected.

## Keeping your answers safe

- Your browser keeps the answers, but clearing your browsing data can remove them. **Do not** use "Clear cookies and site data" for the spr1ngw1ll0wtr33.github.io address: that would also clear your other apps. Your backup file is the safe copy.
- Using a private or incognito window does not keep answers after you close it.

---

## For editors: how to change the questions

All the questions are in **questions.js**. It is a plain text file; open it with the Text Editor.

1. Each section has an `id`, a `title`, an `intro` and a list of `questions`.
2. Each question has an `id`, a `type` and a `label` (the words on screen). The notes at the top of the file explain each type: `text`, `textarea`, `date`, `yesno`, `choice`, `checklist` and `table`.
3. Changing a `label`, `help` text or list item wording is always safe.
4. **Do not change a question's `id`** once answers have been saved, or the saved answer will no longer show. Every `id` must be different. (Ticked items in a checklist are matched by their wording, so if you reword a checklist item, re-tick it.)
5. To add a question, copy an existing one, paste it below, then give it a new `id` and `label`.
6. Keep the commas between items and the quotation marks in pairs. If the planner shows an error or a blank page after an edit, a comma or quotation mark is the usual cause.
7. Save the file and reload the planner (press **F5**) to see the change.

Other files: `index.html` (the page), `styles.css` (the look, including the print layout) and `app.js` (how it works). The planner saves in the browser's storage under the name `HomeEmergencyPlanner` only, so it cannot clash with other apps on the same web address.
