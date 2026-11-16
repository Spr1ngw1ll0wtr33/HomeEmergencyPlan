/*
  Household Emergency Planner - question set
  ==========================================

  *** DRAFT ***
  This is a DRAFT question set. The wording, order and choice of questions
  will be refined later. It is deliberately generic and contains no personal
  information.

  HOW TO EDIT (plain-English notes for whoever edits this file)
  -------------------------------------------------------------
  - Everything the planner asks comes from the list below. Change the words
    inside the quotation marks to change what appears on screen.
  - Each section looks like:
        { id: "home", title: "Our home", intro: "...", newPage: false,
          questions: [ ... ] }
    "newPage: true" starts the section on a fresh sheet of paper when printed.
  - Each question has an "id". The id is how saved answers are matched to the
    question, so:
        * NEVER change the id of a question once people have started answering
          (their saved answer would no longer appear).
        * Every id must be different from every other id in this file.
        * Ids use lower-case letters, numbers and underscores only.
    Changing the "label" (the words people see) is always safe.
  - Question types ("type"):
        "text"      a short answer on one line
        "textarea"  a longer answer over several lines
        "date"      a date, typed as dd/mm/yyyy
        "yesno"     Yes or No
        "choice"    pick one from "options" (a list of words)
        "checklist" tick boxes; "items" is the list. People can add their own.
                    Optional: printStyle: "actionList" prints the ticked items
                    as an empty tick-box list to use on the day; otherwise the
                    ticked items are printed with a tick (meaning "done").
        "table"     rows people can add and remove. "columns" lists the
                    boxes in each row. Optional "defaultRows" pre-fills rows,
                    "rowLabel" names one row (e.g. "Person"), and "addLabel"
                    is the words on the add button.
  - Optional on any question: "help" (a hint shown under the question) and
    "placeholder" (faint example text inside an empty box).
  - Column types in tables: "text" (default), "date" or "textarea".
  - Remember the commas between items, and keep quotation marks in pairs.
    If the planner shows a blank page after an edit, a comma or quotation
    mark is probably missing.
*/

window.PLANNER_QUESTIONS = {
  questionSetVersion: "draft-1",
  sections: [
    /* ---------------------------------------------------------------- 1 */
    {
      id: "about",
      title: "About this plan",
      intro: "Who lives here, including pets, and some details about the plan itself.",
      questions: [
        { id: "plan_title", type: "text", label: "Name of this plan",
          help: "This appears at the top of the printed plan.",
          placeholder: "For example: Our household emergency plan" },
        { id: "household_members", type: "table", label: "Who lives here",
          rowLabel: "Person", addLabel: "Add another person",
          columns: [
            { id: "name", label: "Name" },
            { id: "dob", label: "Date of birth (optional)", type: "date" },
            { id: "needs", label: "Any needs (mobility, hearing, sight, care and so on)", type: "textarea" }
          ] },
        { id: "pets", type: "table", label: "Our pets",
          rowLabel: "Pet", addLabel: "Add another pet",
          columns: [
            { id: "name", label: "Name" },
            { id: "species", label: "Species or breed" },
            { id: "weight", label: "Weight" },
            { id: "needs", label: "Needs (food, medicine, behaviour)", type: "textarea" },
            { id: "vet", label: "Vet (name and phone)" }
          ] },
        { id: "plan_last_reviewed", type: "date", label: "Date this plan was last reviewed",
          help: "This appears at the top of the printed plan. Review it at least once a year." },
        { id: "plan_next_review", type: "date", label: "Date we will next review it" },
        { id: "plan_copies_kept", type: "textarea", label: "Where printed copies of this plan are kept",
          placeholder: "For example: kitchen drawer, in the car, with a relative" }
      ]
    },

    /* ---------------------------------------------------------------- 2 */
    {
      id: "contacts",
      title: "Important contacts",
      intro: "People and services we may need to contact in an emergency.",
      questions: [
        { id: "contacts", type: "table", label: "People to contact",
          rowLabel: "Contact", addLabel: "Add another contact",
          columns: [
            { id: "name", label: "Name" },
            { id: "relationship", label: "Relationship" },
            { id: "phone", label: "Phone" },
            { id: "notes", label: "Notes", type: "textarea" }
          ] },
        { id: "out_of_area_contact", type: "text",
          label: "Someone outside our area we would all contact if separated" },
        { id: "key_numbers", type: "table", label: "Key numbers",
          help: "These are filled in with common UK numbers. Check them, change them or add your own.",
          rowLabel: "Number", addLabel: "Add another number",
          columns: [
            { id: "service", label: "Service" },
            { id: "number", label: "Number" },
            { id: "notes", label: "Notes" }
          ],
          defaultRows: [
            { service: "Emergency (fire, police, ambulance, coastguard)", number: "999", notes: "" },
            { service: "Police (non-emergency)", number: "101", notes: "" },
            { service: "NHS (urgent, not an emergency)", number: "111", notes: "" },
            { service: "Power cut", number: "105", notes: "" },
            { service: "Gas emergency", number: "0800 111 999", notes: "" },
            { service: "Floodline", number: "0345 988 1188", notes: "" },
            { service: "Water company", number: "", notes: "" }
          ] }
      ]
    },

    /* ---------------------------------------------------------------- 3 */
    {
      id: "home",
      title: "Our home",
      intro: "Where things are, so anyone in the household can find them quickly.",
      questions: [
        { id: "water_stopcock", type: "textarea", label: "Where to turn off the water (stopcock)" },
        { id: "gas_off", type: "textarea", label: "Where to turn off the gas" },
        { id: "electricity_off", type: "textarea", label: "Where to turn off the electricity" },
        { id: "fuse_box", type: "text", label: "Where the fuse box (consumer unit) is" },
        { id: "heating_type", type: "choice", label: "Our main heating",
          options: ["Gas boiler", "Oil boiler", "Electric", "Heat pump", "Wood or multi-fuel stove", "Other"] },
        { id: "alarms", type: "table", label: "Smoke and carbon monoxide alarms",
          rowLabel: "Alarm", addLabel: "Add another alarm",
          columns: [
            { id: "type", label: "Type (smoke, heat or carbon monoxide)" },
            { id: "location", label: "Where it is" },
            { id: "tested", label: "Date last tested", type: "date" }
          ] },
        { id: "plan_kept", type: "text", label: "Where this plan is kept" },
        { id: "kit_kept", type: "text", label: "Where our emergency kit is kept" },
        { id: "documents_kept", type: "textarea", label: "Where important documents are kept",
          help: "For example passports, insurance, deeds, bank details." }
      ]
    },

    /* ---------------------------------------------------------------- 4 */
    {
      id: "informed",
      title: "Staying informed",
      intro: "How we find out what is happening.",
      questions: [
        { id: "have_radio", type: "yesno", label: "Do we have a battery or wind-up radio?" },
        { id: "radio_kept", type: "text", label: "Where the radio and spare batteries are kept" },
        { id: "radio_stations", type: "table", label: "Radio stations",
          help: "Look up your local stations and frequencies and fill them in.",
          rowLabel: "Station", addLabel: "Add another station",
          columns: [
            { id: "station", label: "Station" },
            { id: "frequency", label: "Frequency" },
            { id: "notes", label: "Notes" }
          ],
          defaultRows: [
            { station: "Local BBC radio station", frequency: "", notes: "" },
            { station: "Local commercial radio station", frequency: "", notes: "" }
          ] },
        { id: "alert_signups", type: "checklist", label: "Alerts we have signed up to",
          help: "Tick the ones you have done.",
          items: [
            "Flood warnings for our area",
            "Priority Services Register with our electricity network operator",
            "Priority Services Register with our water company",
            "Emergency alerts switched on on our mobile phones",
            "Local council alerts or newsletters",
            "Weather warnings for our area"
          ] }
      ]
    },

    /* ---------------------------------------------------------------- 5 */
    {
      id: "scenario_a",
      title: "Scenario A – Staying at home",
      intro: "Power cut, storm, loss of water or gas, long outages, being cut off by flooding, or being told to stay inside (shelter in place).",
      newPage: true,
      questions: [
        { id: "a_situations", type: "checklist", label: "Situations this part of the plan covers",
          items: [
            "Power cut",
            "Storm",
            "Loss of water",
            "Loss of gas",
            "Long outage (more than a day)",
            "Cut off by flooding",
            "Told to shelter in place"
          ] },
        { id: "a_who_does_what", type: "table", label: "Who does what",
          rowLabel: "Job", addLabel: "Add another job",
          columns: [
            { id: "person", label: "Person" },
            { id: "job", label: "What they do", type: "textarea" }
          ] },
        { id: "a_heating", type: "textarea", label: "How we keep warm without power" },
        { id: "a_light", type: "textarea", label: "Light without power (torches, lanterns, batteries)" },
        { id: "a_cooking", type: "textarea", label: "Cooking and hot drinks without power" },
        { id: "a_water", type: "textarea", label: "Our water plan",
          help: "How much drinking water we keep, where, and how we would get more." },
        { id: "a_supplies", type: "checklist", label: "Supplies to have ready at home",
          printStyle: "actionList",
          items: [
            "Torches and spare batteries",
            "Battery or wind-up radio",
            "Bottled water",
            "Food that keeps and needs no cooking",
            "Tin opener",
            "Warm clothes and blankets",
            "First aid kit",
            "Phone power bank, charged",
            "Cash in small notes",
            "Pet food and water"
          ] },
        { id: "a_neighbours", type: "table", label: "Checking on neighbours",
          rowLabel: "Neighbour", addLabel: "Add another neighbour",
          columns: [
            { id: "name", label: "Name" },
            { id: "address", label: "Address" },
            { id: "needs", label: "Needs" },
            { id: "who_checks", label: "Who checks on them" }
          ] },
        { id: "a_shelter", type: "textarea", label: "If we are told to shelter in place, what we do",
          placeholder: "For example: go in, stay in, tune in; close windows and doors" },
        { id: "a_when_leave", type: "textarea", label: "When we would decide to leave" }
      ]
    },

    /* ---------------------------------------------------------------- 6 */
    {
      id: "scenario_b",
      title: "Scenario B – Leaving with notice (1 to 2 hours)",
      intro: "For example a flood warning or being asked to evacuate.",
      newPage: true,
      questions: [
        { id: "b_triggers", type: "textarea", label: "What would make us leave" },
        { id: "b_dest_first", type: "textarea", label: "Where we would go: first choice",
          help: "Name, address and phone number." },
        { id: "b_dest_second", type: "textarea", label: "Where we would go: second choice" },
        { id: "b_route_first", type: "textarea", label: "Our route: first choice" },
        { id: "b_route_alt", type: "textarea", label: "Other routes if the first is blocked" },
        { id: "b_roads_avoid", type: "textarea", label: "Roads that flood or should be avoided" },
        { id: "b_packing_cards", type: "table", label: "Who packs what (packing cards)",
          help: "Give each card to one person. Change the cards to suit you.",
          rowLabel: "Card", addLabel: "Add another card",
          columns: [
            { id: "card", label: "Card" },
            { id: "person", label: "Who packs it" },
            { id: "contents", label: "What goes in it", type: "textarea" },
            { id: "kept", label: "Where it is kept" }
          ],
          defaultRows: [
            { card: "Documents and medication", person: "", contents: "", kept: "" },
            { card: "Food and water", person: "", contents: "", kept: "" },
            { card: "Dogs", person: "", contents: "", kept: "" },
            { card: "Car and route", person: "", contents: "", kept: "" }
          ] },
        { id: "b_shutdown", type: "checklist", label: "Shutting the house down before we leave",
          help: "Tick the steps that apply to our home. They print as a checklist to use on the day.",
          printStyle: "actionList",
          items: [
            "Turn off the gas",
            "Turn off the electricity",
            "Turn off the water at the stopcock",
            "Move valuables and documents upstairs",
            "Put flood protection in place",
            "Close and lock all windows and doors",
            "Take keys, phones and chargers",
            "Tell our contact where we are going"
          ] },
        { id: "b_dogs", type: "textarea", label: "Our dogs",
          help: "Leads, food, bowls, medicine, crate or carrier, vaccination records." },
        { id: "b_separated", type: "textarea", label: "How we contact each other if separated" },
        { id: "b_meet_near", type: "text", label: "Meeting point near home" },
        { id: "b_meet_away", type: "text", label: "Meeting point away from our area" }
      ]
    },

    /* ---------------------------------------------------------------- 7 */
    {
      id: "scenario_c",
      title: "Scenario C – Leaving instantly (house fire)",
      intro: "Get out, stay out, call 999. Never go back in for belongings or pets.",
      newPage: true,
      questions: [
        { id: "c_escape_routes", type: "table", label: "Escape routes from each room",
          rowLabel: "Room", addLabel: "Add another room",
          columns: [
            { id: "room", label: "Room" },
            { id: "main_way", label: "Main way out" },
            { id: "second_way", label: "Second way out" }
          ] },
        { id: "c_order", type: "table", label: "The order people and dogs leave",
          rowLabel: "Place in order", addLabel: "Add another",
          columns: [
            { id: "who", label: "Person or pet" },
            { id: "helper", label: "Who helps them" },
            { id: "notes", label: "Notes" }
          ] },
        { id: "c_keys", type: "text", label: "Where door and window keys are kept" },
        { id: "c_ladder_location", type: "text", label: "Where the escape ladder is kept" },
        { id: "c_ladder_checked", type: "date", label: "Date the escape ladder was last checked" },
        { id: "c_ladder_checks", type: "textarea", label: "What we check on the ladder" },
        { id: "c_chuck_bag", type: "text", label: "Where the chuck bag (grab bag) is kept" },
        { id: "c_meet_outside", type: "text", label: "Where we meet outside" },
        { id: "c_who_calls", type: "text", label: "Who calls 999" },
        { id: "c_practised", type: "date", label: "Date we last practised our escape" },
        { id: "c_practise_notes", type: "textarea", label: "Notes from practising" }
      ]
    },

    /* ---------------------------------------------------------------- 8 */
    {
      id: "medical",
      title: "Medical information",
      intro: "Information that helps us, or someone helping us, in an emergency.",
      newPage: true,
      questions: [
        { id: "medication", type: "table", label: "Medication",
          rowLabel: "Medicine", addLabel: "Add another medicine",
          columns: [
            { id: "person", label: "Person" },
            { id: "medicine", label: "Medicine" },
            { id: "dose", label: "Dose and when taken" },
            { id: "kept", label: "Where kept" }
          ] },
        { id: "conditions", type: "textarea", label: "Medical conditions" },
        { id: "allergies", type: "textarea", label: "Allergies" },
        { id: "equipment", type: "textarea", label: "Medical equipment",
          help: "Include anything that needs power, and where it is kept." },
        { id: "gp_details", type: "textarea", label: "GP surgery (name, address, phone)" },
        { id: "pharmacy", type: "text", label: "Pharmacy (name and phone)" }
      ]
    },

    /* ---------------------------------------------------------------- 9 */
    {
      id: "notes",
      title: "Notes and extra items",
      intro: "Anything else we want in the plan.",
      questions: [
        { id: "general_notes", type: "textarea", label: "Notes" },
        { id: "things_to_buy", type: "checklist", label: "Things still to do or buy",
          help: "Add your own items with the box below. Tick them when done.",
          items: [] }
      ]
    }
  ]
};
