# Example: Adding Conditional Fields to llc-formation2

## Simple Example - Single Field

Here's how to add a QuickBooks setup field that only appears for Executive package:

```typescript
// Add this to the llc-formation2 fields array in product-form.ts

{
  key: "executiveServicesSection",
  wrappers: ["panel"],
  props: {
    label: "Executive Package - Premium Services"
  },
  expressions: {
    // This entire section only shows for executive tier
    hide: "model._packageContext?.packageTier !== 'executive'"
  },
  fieldGroup: [
    {
      key: "quickbooksSetup",
      type: "checkbox",
      props: {
        label: "QuickBooks™ Company Setup",
        description: "We'll set up your QuickBooks company file with chart of accounts"
      }
    },
    {
      key: "strategyConsultation",
      type: "checkbox",
      props: {
        label: "Schedule 30-Minute Strategy Consultation",
        description: "Book your included consultation with a Washington attorney"
      }
    }
  ]
}
```

## Progressive Features Example

Show different fields for each tier level:

```typescript
// Base services - shown for ALL tiers
{
  key: "baseServicesSection",
  wrappers: ["panel"],
  props: {
    label: "Essential Services (All Packages)"
  },
  fieldGroup: [
    {
      key: "llcFormationConfirm",
      type: "checkbox",
      props: {
        label: "I confirm LLC formation filing with WA Secretary of State",
        required: true
      }
    },
    {
      key: "einApplication",
      type: "checkbox",
      props: {
        label: "Federal EIN Application needed",
        required: true
      }
    }
  ]
},

// Complete & Executive only - hidden for Essentials
{
  key: "completeServicesSection",
  wrappers: ["panel"],
  props: {
    label: "Complete Package - Additional Services"
  },
  expressions: {
    // Hide for essentials tier only
    hide: "model._packageContext?.packageTier === 'essentials'"
  },
  fieldGroup: [
    {
      key: "customizedOperatingAgreement",
      type: "radio",
      props: {
        label: "Operating Agreement Customization Level",
        required: true,
        options: [
          { value: "standard", label: "Standard Template" },
          { value: "custom", label: "Fully Customized" }
        ]
      }
    },
    {
      key: "businessLicenseSetup",
      type: "checkbox",
      props: {
        label: "WA State Business License Registration",
        description: "We'll handle your state business license registration"
      }
    }
  ]
},

// Executive only - highest tier features
{
  key: "executiveServicesSection",
  wrappers: ["panel"],
  props: {
    label: "Executive Package - Premium Services"
  },
  expressions: {
    // Only show for executive tier
    hide: "model._packageContext?.packageTier !== 'executive'"
  },
  fieldGroup: [
    {
      key: "quickbooksSetup",
      type: "checkbox",
      props: {
        label: "QuickBooks™ Company Setup"
      }
    },
    {
      key: "ongoingComplianceYear1",
      type: "checkbox",
      props: {
        label: "Ongoing Compliance Services (Year One)",
        description: "Annual reports, license renewals, deadline tracking"
      }
    }
  ]
}
```

## Testing the Setup

1. Navigate to `/customer/product?query=llc-essentials`
2. Open browser console
3. You should see: `Initialized package context: {packageTier: 'essentials', ...}`
4. Click "Compare Packages" and switch to Executive
5. You should see: `Initialized package context: {packageTier: 'executive', ...}`
6. Fields with `hide: "model._packageContext?.packageTier !== 'executive'"` will now appear

## Debugging

To verify package context is working:

1. Add a test field to llc-formation2:
```typescript
{
  key: "debugPackageTier",
  type: "input",
  props: {
    label: "DEBUG: Current Package Tier",
    disabled: true
  },
  expressions: {
    "props.placeholder": "model._packageContext?.packageTier || 'Not Set'"
  }
}
```

2. This field will display the current tier value
3. Remove after testing
