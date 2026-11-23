# Family plan tool: how to use it

The Family plan tool is one file, **family-plan-tool.html**. It opens in Firefox and works without the internet. It helps us record our plan for each section of the general guidance, then makes two documents for LibreOffice Writer: our **family plan** and a separate **to-do list**.

**Everything we type stays on this computer.** Nothing is sent anywhere. The tool never asks for passwords or PINs. Never upload a saved file or a downloaded plan to GitHub or any other website.

## 1. Getting the tool from GitHub (once on each computer)

1. Open Firefox and go to **github.com/spr1ngw1ll0wtr33/HomeEmergencyPlan**. Sign in if asked.
2. Above the list of files, click the button showing the branch name (it may say **main**). Choose the branch that holds the latest work.
3. Click the **planner** folder, then click **family-plan-tool.html**.
4. On the right, above the file's contents, click the **Download raw file** button (a small arrow pointing down into a tray).
5. If Firefox asks, choose **Save File**. The file goes into your **Downloads** folder.
6. Open the **Files** app. Make a folder called **Family plan** inside your **Documents** folder, and move **family-plan-tool.html** into it.

## 2. Opening the tool in Firefox

1. Open the **Family plan** folder in the Files app.
2. Right-click **family-plan-tool.html**, choose **Open With**, then **Firefox**. (If Firefox is your usual browser, you can just double-click it.)
3. Once it is open, press **Ctrl** and **D** together to bookmark it, so you can find it again.
4. Always open it the same way, in Firefox. Answers kept in Firefox do not show up in another browser.

## 3. Filling it in

1. Choose a section from the list on the left, or press **Begin with the first section**.
2. Each section has an introduction, the general guidance, and four parts to fill in:
   1. **Our plan**: type our answers in the boxes.
   2. **Resources, tools and equipment**: for each "Do we have …?" item, click **Yes**, **In progress**, **No** or **Not sure**. You can type a note under any item.
   3. **Where it is stored.**
   4. **How we check it works**, and how often.
3. To add our own item, type it in the box called **Add our own item** and press **Add item**.
4. If a section does not apply to us, tick **Not relevant to us**. It is left out of the plan and the to-do list. Untick it to bring it back; nothing typed is lost.
5. Use the **Next** and **Previous** buttons at the bottom of each section to move through.
6. The list on the left shows each section as **Not started**, **Part done**, **Complete** or **Not relevant**. Overall progress is shown at the top of the list.
7. Answers are saved on this computer as we type. The words under the title show when, for example "Saved on 23/11/2026 at 6:20 pm".
8. Write dates as dd/mm/yyyy, for example 23/11/2026.

## 4. Saving our progress to a file

Do this at the end of every session. The file is our backup, and it is how we move our answers to the other computer.

1. Press **Save to file** at the top.
2. A file called something like **family-plan-23-11-2026.json** goes into the **Downloads** folder. (If Firefox asks, choose **Save File**.)
3. Move it into the **Family plan** folder. Copy it to a USB stick as well if you can.

## 5. Opening a saved file

Use this to carry on from a backup, or to carry on using the other computer.

1. Open the tool in Firefox.
2. Press **Open a saved file** at the top.
3. Find the file ending in **.json** (for example **family-plan-23-11-2026.json**), click it once, then press **Open**.
4. If the tool already has answers in it, it asks first. Press **Yes, open the file** to replace them, or **Cancel** to keep what is there.
5. A part-finished file opens fine; just carry on where you left off.
6. If the file is the wrong kind, the tool says so and changes nothing.

## 6. Downloading the plan and the to-do list

1. Click **Download our plan and to-do list** at the bottom of the list on the left.
2. Press **Download our family plan (.odt)**. A file called something like **family-plan-23-11-2026.odt** goes into **Downloads**.
3. Press **Download our to-do list (.odt)**. A file called something like **family-plan-to-do-23-11-2026.odt** goes into **Downloads**.
4. Move both files into the **Family plan** folder.

The **to-do list** shows every "Do we have …?" item with its section and note. Rows are coloured **green** for Yes, **amber** for In progress and **red** for No or Not sure; white rows have not been answered yet. Work through the list, update the tool, then download a fresh list.

## 7. Opening them in LibreOffice Writer

1. In the Files app, double-click the **.odt** file. It opens in LibreOffice Writer. (If it does not, right-click it, choose **Open With**, then **LibreOffice Writer**.)
2. To jump between sections, press **F5** to open the Navigator and click a heading.
3. To add a table of contents to the plan: click at the start of the document, then choose **Insert**, **Table of Contents and Index**, **Table of Contents, Index or Bibliography**, and press **OK**.
4. To print, press **Ctrl** and **P** together. Check the paper size is **A4**.
5. To make a PDF, choose **File**, **Export As**, **Export as PDF**.
6. If you change the document in Writer, save it with **File**, **Save** and choose **Use ODF Format!** if asked. Changes made in Writer do not go back into the tool, so make lasting changes in the tool and download a fresh copy.

## 8. Starting again

1. Press **Save to file** first, just in case.
2. Press **Start again** at the top.
3. Read the message, then press **Delete our answers and start again**.

This clears only the Family plan tool's answers on this computer. Saved files, the older Household Emergency Planner and everything else are not affected.

## 9. Keeping our answers safe

1. Firefox keeps the answers, but clearing Firefox's history, cookies or site data can remove them. The saved **.json** file is the safe copy.
2. A private window does not keep answers after it is closed.
3. Keep more than one copy of the saved file, for example on a USB stick.

---

## For editors: changing the sections and questions

1. Open **family-plan-tool.html** with the **Text Editor** (right-click, **Open With**, **Text Editor**).
2. Near the top of the script is a block headed **FAMILY PLAN TOOL: CONTENT**. The notes at the top of that block explain what each part means.
3. Changing the wording of an introduction, guidance text, question or item is always safe.
4. **Never change an `id`** once answers have been saved, or the saved answer will no longer show.
5. To add a question or item, copy an existing one, paste it underneath, and give it a new `id`.
6. Keep the commas between items and the quotation marks in pairs. Save the file and reload Firefox (press **F5**).

The tool keeps its answers under its own name (`FamilyPlanTool`), so it cannot clash with the older Household Emergency Planner or other apps.
