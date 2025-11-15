# Package Tier Conditional Field Visibility

## Overview
The form system now supports conditional field visibility based on the selected package tier. This allows the `llc-formation2` form to dynamically show/hide fields and sections based on whether the user selected Essentials, Complete, or Executive packages.

## How It Works

When a package form is loaded, the component automatically injects package context metadata into the form model:

```typescript
model._packageContext = {
  packageId: 'llc-essentials',              // The selected package ID
  packageTier: 'essentials',                // 'essentials' | 'complete' | 'executive' | 'addon'
  packageName: 'New Business Essentials Package',  // Display name
  packageCost: 999.00                       // Package cost
}
```

## Usage in Form Definitions

### 1. Hide/Show Fields Based on Tier

Use Formly's `expressions.hide` property to conditionally show fields:

```typescript
{
  key: "quickbooksSetup",
  type: "checkbox",
  props: {
    label: "QuickBooks Company Setup",
    description: "Included with Executive package"
  },
  expressions: {
    // Only show for executive tier
    hide: "model._packageContext?.packageTier !== 'executive'"
  }
}
```

### 2. Hide/Show Entire Sections

Apply conditions to field groups (sections):

```typescript
{
  key: "advancedServicesSection",
  wrappers: ["panel"],
  props: {
    label: "Advanced Services"
  },
  expressions: {
    // Hide for essentials, show for complete and executive
    hide: "model._packageContext?.packageTier === 'essentials'"
  },
  fieldGroup: [
    {
      key: "customOperatingAgreement",
      type: "checkbox",
      props: { label: "Customized Operating Agreement" }
    },
    {
      key: "businessLicenseRegistration",
      type: "checkbox",
      props: { label: "WA State Business License Registration" }
    }
  ]
}
```

### 3. Multiple Tier Conditions

Show fields for specific tiers only:

```typescript
{
  key: "complianceServices",
  wrappers: ["panel"],
  props: {
    label: "Ongoing Compliance Services (Year One)"
  },
  expressions: {
    // Only show for executive tier
    hide: "!['executive'].includes(model._packageContext?.packageTier)"
  },
  fieldGroup: [ /* executive-only fields */ ]
}
```

### 4. Conditional Field Properties

Change field properties based on tier:

```typescript
{
  key: "registeredAgentService",
  type: "radio",
  props: {
    label: "Registered Agent Service",
    options: [
      { value: "1year", label: "1 Year (Included)" },
      { value: "3year", label: "3 Years (Add $200)" }
    ]
  },
  expressions: {
    // Make required for complete and executive
    "props.required": "['complete', 'executive'].includes(model._packageContext?.packageTier)",

    // Change description based on tier
    "props.description": `
      model._packageContext?.packageTier === 'essentials'
        ? '1 year of registered agent service included'
        : 'Choose your registered agent service term'
    `
  }
}
```

## Available Expression Context

In any `expressions` block, you have access to:

- `model._packageContext.packageId` - The selected package (e.g., 'llc-essentials')
- `model._packageContext.packageTier` - The tier level (e.g., 'essentials', 'complete', 'executive')
- `model._packageContext.packageName` - Display name of the package
- `model._packageContext.packageCost` - Cost of the package
- `model.*` - Any other form field values

## Common Patterns

### Show for Higher Tiers Only
```typescript
expressions: {
  // Show for complete and executive, hide for essentials
  hide: "model._packageContext?.packageTier === 'essentials'"
}
```

### Show for Specific Tier Only
```typescript
expressions: {
  // Only show for executive
  hide: "model._packageContext?.packageTier !== 'executive'"
}
```

### Show for Multiple Specific Tiers
```typescript
expressions: {
  // Show for essentials and complete, hide for executive
  hide: "!['essentials', 'complete'].includes(model._packageContext?.packageTier)"
}
```

### Conditional Required Field
```typescript
{
  key: "someField",
  type: "input",
  props: {
    label: "Optional for Essentials, Required for Others"
  },
  expressions: {
    "props.required": "model._packageContext?.packageTier !== 'essentials'"
  }
}
```

## Benefits

1. **Single Form Definition** - One `llc-formation2` form works for all packages
2. **Data-Driven** - All logic in form config, not component code
3. **Maintainable** - Easy to see which fields apply to which tiers
4. **Package Switching** - Users can upgrade/downgrade without losing common data
5. **Dynamic** - Fields automatically show/hide when package changes

## Package Tier Values

| Package | Tier Value | Form ID |
|---------|-----------|---------|
| Essentials | `'essentials'` | `'llc-essentials'` |
| Complete | `'complete'` | `'llc-complete'` |
| Executive | `'executive'` | `'llc-executive'` |
| Add-ons | `'addon'` | Various |

## Next Steps

Now you can update the `llc-formation2` form definition in `product-form.ts` to add conditional visibility to fields and sections based on these tier values.
