# LLC Formation Form Changes - Task List

## Overview
Changes to be made to the `llc-formation2` form in `product-form.ts`

---

## Task 1: Executive Package - EIN Question Flow
**Location:** Line 508-517 (Business Identifiers Section)

**Current State:**
- Single optional EIN input field
- Description: "Required if you plan to hire employees or open a business bank account"

**Changes Required:**
1. Add conditional visibility: `hide: "model._packageContext?.packageTier !== 'executive'"`
2. Replace current EIN field with new flow:
   - **NEW FIELD:** Radio button "Do you have an Employer Identification Number (EIN)?"
     - Options: Yes / No
     - Required: true (for executive package)
   - **IF YES:** Show input field to enter EIN
   - **IF NO:** Show informational text: "We will obtain an EIN for you as part of your Executive package"

---

## Task 2: Executive Package - Registered Agent Question Flow
**Location:** Line 552-700+ (Registered Agent Section)

**Current State:**
- Radio selection for agent type: Self / Commercial / Non-commercial
- Multiple conditional fields for agent details

**Changes Required:**
1. Add conditional visibility to entire section: `hide: "model._packageContext?.packageTier !== 'executive'"`
2. Add new question at the top of this section:
   - **NEW FIELD:** Radio button "Do you have a Registered Agent?"
     - Options: Yes / No
     - Required: true (for executive package)
   - **IF YES:** Show existing registered agent fields (all current fields)
   - **IF NO:** Show informational text: "We will provide Registered Agent services for you as part of your Executive package"

---

## Task 3: Remove "Other Provisions" Field
**Location:** Line 740-748 (within a section)

**Action:**
- **DELETE** the entire field:
  ```typescript
  {
    "key": "otherProvisions",
    "type": "textarea",
    "props": {
      "label": "Other Provisions",
      ...
    }
  }
  ```

---

## Task 4: Handle "Executor Information" Section
**Location:** Line 972-1037 (Executor Section)

**Decision Needed:** Remove entirely OR make admin-only?

**Option A - Remove Entirely:**
- Delete the entire `executorSection` object (lines 972-1037)

**Option B - Make Admin-Only (Recommended):**
- Keep the section but add expression to hide from customers:
  ```typescript
  expressions: {
    hide: "true"  // Hidden for all customer-facing forms
  }
  ```
- Note: This preserves the field structure in case admin interface needs it later

**Question for User:** Which option do you prefer? I recommend Option B to preserve the structure.

---

## Task 5: Allow Multiple Governors
**Location:** Line 1039-1104 (Governors Section)

**Current State:**
- Single governor with individual/entity type selection
- "I am a Governor" checkbox

**Changes Required:**
1. Convert to **Formly Repeat Section** to allow adding multiple governors
2. Structure:
   - Add "Add Governor" button
   - Each governor entry has:
     - "I am a Governor" checkbox
     - Governor Type (Individual/Entity)
     - Conditional fields based on type (First/Last Name OR Entity Name)
   - Allow users to add/remove governor entries
3. Minimum: 1 governor (at least one required)
4. Maximum: Unlimited (or set reasonable limit like 10)

**Technical Implementation:**
- Use Formly's `type: 'repeat'` field type
- Each repeated section contains the current governor fieldGroup

---

## Task 6: Nature of Business - Single Selection Only
**Location:** Line 1113-1150

**Current State:**
- Type: `multicheckbox`
- Label: "What is your business' nature of business? (may select more than one)"

**Changes Required:**
1. Change type from `multicheckbox` to `select`
2. Update label: "What is your business' nature of business?"
3. Keep all existing options (28 options total)
4. Make `required: true`
5. Keep the conditional "Other" textarea field that shows when "Other" is selected

---

## Task 7: Remove "Email Notifications" Section
**Location:** Line 1283-1297

**Action:**
- **DELETE** the entire section:
  ```typescript
  {
    "key": "emailOptInSection",
    "wrappers": ["panel"],
    "props": {
      "label": "Email Notifications"
    },
    ...
  }
  ```

---

## Task 8: Add/Update Disclaimer Section
**Location:** End of form (before closing array) - ~line 1473

**Current State:**
- No disclaimer section exists

**Changes Required:**
1. **ADD NEW SECTION** at the end of the form (before final closing brackets)
2. Section structure:
   ```typescript
   {
     "key": "disclaimerSection",
     "wrappers": ["panel"],
     "props": {
       "label": "Terms and Disclaimer"
     },
     "fieldGroup": [
       {
         "key": "disclaimerText",
         "type": "...",  // Read-only text display
         "props": {
           "label": "",
           "description": "[DISCLAIMER TEXT FROM CLB - TO BE PROVIDED]"
         }
       },
       {
         "key": "disclaimerSignature",
         "type": "input",
         "props": {
           "label": "Electronic Signature",
           "placeholder": "Type your full name to sign",
           "required": true,
           "description": "By typing your name, you agree to the terms above"
         }
       },
       {
         "key": "disclaimerDate",
         "type": "input",
         "props": {
           "type": "date",
           "label": "Signature Date",
           "required": true
         }
       }
     ]
   }
   ```

**PENDING:** Need disclaimer text from CLB

---

## Task 9: Simplify "Optional Documents - Operating Agreement"
**Location:** Line 1448-1458 (within Optional Documents section)

**Current State:**
- Radio button with two options:
  - "I have an Operating Agreement"
  - "I need to create one"

**Changes Required:**
- Replace with single checkbox:
  ```typescript
  {
    "key": "hasOperatingAgreement",
    "type": "checkbox",
    "props": {
      "label": "I already have an operating agreement, I don't need one."
    }
  }
  ```

---

## Task 10: Simplify "Business Licenses & Permits"
**Location:** Line 1461-1471 (within Optional Documents section)

**Current State:**
- Multicheckbox with options:
  - "Business License"
  - "Permit"

**Changes Required:**
- Replace with single checkbox:
  ```typescript
  {
    "key": "hasBusinessLicense",
    "type": "checkbox",
    "props": {
      "label": "I already have a business license, I don't need one."
    }
  }
  ```

---

## Summary of Changes by Type

### Additions:
- ✅ EIN question flow (Executive only)
- ✅ Registered Agent question flow (Executive only)
- ✅ Disclaimer section with signature field
- ✅ Multiple governors support (repeating section)

### Modifications:
- ✅ Nature of Business: multicheckbox → select (single choice)
- ✅ Operating Agreement: radio → checkbox
- ✅ Business Licenses: multicheckbox → checkbox

### Removals:
- ❌ Other Provisions field
- ❌ Email Notifications section
- ❌ Executor Information section (or hide for admin-only)

---

## Questions for Approval

1. **Executor Information:** Remove completely OR hide for admin-only use?
2. **Disclaimer Text:** Do you have the disclaimer text from CLB, or should I use placeholder text for now?
3. **Multiple Governors:** Any limit on number of governors? (Suggest max 10)
4. **EIN/Registered Agent Questions:** Should these conditional flows ONLY appear for Executive, or for Complete tier as well?

---

## Implementation Order (Recommended)

1. Simple deletions first (Tasks 3, 7)
2. Simple modifications (Tasks 6, 9, 10)
3. Conditional Executive flows (Tasks 1, 2)
4. Complex changes (Task 5 - Multiple Governors)
5. New sections (Task 8 - Disclaimer)
6. Final testing and validation

**Estimated Time:** 2-3 hours for implementation and testing
