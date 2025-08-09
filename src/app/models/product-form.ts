export class ProductForm {

    public getForm(name: string) {
        return this.forms[name as keyof typeof this.forms]
    }
    forms = {
        'llc-formation': {
            title: "LLC Formation",
            instructions: 'Please provide the following information',
            cost: 325.00,
            fields: [
                {
                    "key": "companyInformation",
                    "wrappers": ["panel"],
                    "templateOptions": {
                        "label": "Company Information"
                    },
                    "fieldGroup": [
                        {
                            "key": "llcName",
                            "type": "input",
                            "props": {
                                "label": "LLC Name",
                                "placeholder": "Enter your LLC name",
                                "required": true,
                                "description": "The LLC name must end with 'Limited Liability Company', 'LLC', or 'L.L.C.'"
                            }
                        },
                        {
                            "key": "certificateOfFormation",
                            "type": "radio",
                            "props": {
                                "label": "Certificate of Formation Filing Method",
                                "required": true,
                                "options": [
                                    { "value": "online", "label": "Online Filing" },
                                    { "value": "mail", "label": "Mail Filing" }
                                ],
                                "description": "Select your filing method for the Certificate of Formation."
                            }
                        },
                        {
                            "key": "filingFees",
                            "type": "input",
                            "props": {
                                "label": "Filing Fees",
                                "placeholder": "Enter estimated filing fees",
                                "required": false,
                                "description": "Estimated fees for filing your Certificate of Formation and related filings."
                            }
                        }
                    ]
                },
               
            ]
        },



        "llc-formation2": {
            "title": "Washington LLC Formation",
            "instructions": "Please provide the following information for your Washington Limited Liability Company formation",
            "cost": 325.00,
            "fields": [
                {
                    "key": "businessTypeSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Business Type Selection"
                    },
                    "fieldGroup": [
                        {
                            "key": "businessFormationType",
                            "type": "radio",
                            "props": {
                                "label": "Type of Business Formation",
                                "required": true,
                                "options": [
                                    { "value": "form", "label": "Form a business" },
                                    { "value": "register", "label": "Register a foreign business" }
                                ]
                            }
                        },
                        {
                            "key": "businessEntityType",
                            "type": "select",
                            "props": {
                                "label": "Business Entity Type",
                                "required": true,
                                "options": [
                                    { "value": "WA_LLC", "label": "WA LIMITED LIABILITY COMPANY" },
                                    { "value": "WA_LLLP", "label": "WA LIMITED LIABILITY LIMITED PARTNERSHIP" },
                                    { "value": "WA_LLP", "label": "WA LIMITED LIABILITY PARTNERSHIP" },
                                    { "value": "WA_LP", "label": "WA LIMITED PARTNERSHIP" },
                                    { "value": "WA_NONPROFIT", "label": "WA NONPROFIT CORPORATION" },
                                    { "value": "WA_NONPROFIT_PROF", "label": "WA NONPROFIT PROFESSIONAL SERVICE CORPORATION" },
                                    { "value": "WA_PROF_LLP", "label": "WA PROFESSIONAL LIMITED LIABILITY PARTNERSHIP" },
                                    { "value": "WA_PROF_LLC", "label": "WA PROFESSIONAL LIMITED LIABILITY COMPANY" },
                                    { "value": "WA_PROF_CORP", "label": "WA PROFESSIONAL SERVICE CORPORATION" },
                                    { "value": "WA_PROFIT_CORP", "label": "WA PROFIT CORPORATION" },
                                    { "value": "WA_SOCIAL_CORP", "label": "WA SOCIAL PURPOSE CORPORATION" }
                                ]
                            },
                            "expressions": {
                                "hide": "field.model?.businessFormationType !== 'form'"
                            }
                        },
                        {
                            "key": "foreignBusinessEntityType",
                            "type": "select",
                            "props": {
                                "label": "Foreign Business Entity Type",
                                "required": true,
                                "options": [
                                    { "value": "FOREIGN_LLC", "label": "FOREIGN LIMITED LIABILITY COMPANY" },
                                    { "value": "FOREIGN_LLLP", "label": "FOREIGN LIMITED LIABILITY LIMITED PARTNERSHIP" },
                                    { "value": "FOREIGN_LLP", "label": "FOREIGN LIMITED LIABILITY PARTNERSHIP" },
                                    { "value": "FOREIGN_LP", "label": "FOREIGN LIMITED PARTNERSHIP" },
                                    { "value": "FOREIGN_NONPROFIT", "label": "FOREIGN NONPROFIT CORPORATION" },
                                    { "value": "FOREIGN_NONPROFIT_PROF", "label": "FOREIGN NONPROFIT PROFESSIONAL SERVICE CORPORATION" },
                                    { "value": "FOREIGN_PROF_LLC", "label": "FOREIGN PROFESSIONAL LIMITED LIABILITY COMPANY" },
                                    { "value": "FOREIGN_PROF_LLP", "label": "FOREIGN PROFESSIONAL LIMITED LIABILITY PARTNERSHIP" },
                                    { "value": "FOREIGN_PROF_CORP", "label": "FOREIGN PROFESSIONAL SERVICE CORPORATION" },
                                    { "value": "FOREIGN_PROFIT_CORP", "label": "FOREIGN PROFIT CORPORATION" }
                                ]
                            },
                            "expressions": {
                                "hide": "field.model?.businessFormationType !== 'register'"
                            }
                        },
                        {
                            "key": "deferInitialReport",
                            "type": "checkbox",
                            "props": {
                                "label": "Defer Initial Report: I would like to file my initial report at a later time. I acknowledge that an initial report is due within 120 days of the effective date of this formation per RCW 23.95.255."
                            }
                        }
                    ]
                },
                {
                    "key": "businessIdentifiers",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Business Identifiers"
                    },
                    "fieldGroup": [
                        {
                            "key": "hasUBI",
                            "type": "radio",
                            "props": {
                                "label": "Do you already have a UBI Number?",
                                "required": true,
                                "options": [
                                    { "value": "yes", "label": "Yes" },
                                    { "value": "no", "label": "No" }
                                ]
                            }
                        },
                        {
                            "key": "ubi",
                            "type": "input",
                            "props": {
                                "label": "Unified Business Identifier (UBI)",
                                "placeholder": "Enter your existing UBI number",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.hasUBI !== 'yes'"
                            }
                        },
                        {
                            "key": "ein",
                            "type": "input",
                            "props": {
                                "label": "Employer Identification Number (EIN)",
                                "placeholder": "Enter your EIN (if applicable)",
                                "required": false,
                                "description": "Required if you plan to hire employees or open a business bank account."
                            }
                        }
                    ]
                },
                {
                    "key": "companyInformation",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Company Information"
                    },
                    "fieldGroup": [
                        {
                            "key": "llcName",
                            "type": "input",
                            "props": {
                                "label": "LLC Name",
                                "placeholder": "Enter your LLC name",
                                "required": true,
                                "description": "The name must contain 'Limited Liability Company', 'Limited Liability' and abbreviation 'Co.' or the abbreviation 'L.L.C.' or 'LLC'. Maximum 255 characters."
                            },
                        },
                        {
                            "key": "nameSubmissionType",
                            "type": "radio",
                            "props": {
                                "label": "Name Submission",
                                "required": true,
                                "options": [
                                    { "value": "submit", "label": "Submit a name for review" },
                                    { "value": "lookup", "label": "Look up existing name" }
                                ]
                            }
                        }
                    ]
                },
                {
                    "key": "registeredAgentSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Registered Agent Information"
                    },
                    "fieldGroup": [
                        {
                            "key": "registeredAgentType",
                            "type": "radio",
                            "props": {
                                "label": "Registered Agent Type",
                                "required": true,
                                "options": [
                                    { "value": "self", "label": "I am the Registered Agent. Use my Contact Information." },
                                    { "value": "commercial", "label": "Commercial Registered Agent" },
                                    { "value": "noncommercial", "label": "Non Commercial Registered Agent" }
                                ]
                            }
                        },
                        {
                            "key": "registeredAgentConsent",
                            "type": "checkbox",
                            "props": {
                                "label": "I declare under penalty of perjury that the WA Limited Liability Company has in its records a signed document containing the consent of the person or business named as registered agent to serve in that capacity."
                            },
                            "expressions": {
                                "hide": "field.model?.registeredAgentType === 'self'"
                            }
                        },
                        {
                            "key": "registeredAgentEntityType",
                            "type": "radio",
                            "props": {
                                "label": "Registered Agent Entity Type",
                                "required": true,
                                "options": [
                                    { "value": "individual", "label": "Individual" },
                                    { "value": "entity", "label": "Entity" }
                                ]
                            },
                            "expressions": {
                                "hide": "field.model?.registeredAgentType === 'self'"
                            }
                        },
                        {
                            "key": "registeredAgentFirstName",
                            "type": "input",
                            "props": {
                                "label": "First Name",
                                "placeholder": "Enter first name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.registeredAgentType === 'self' || field.model?.registeredAgentEntityType !== 'individual'"
                            }
                        },
                        {
                            "key": "registeredAgentLastName",
                            "type": "input",
                            "props": {
                                "label": "Last Name",
                                "placeholder": "Enter last name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.registeredAgentType === 'self' || field.model?.registeredAgentEntityType !== 'individual'"
                            }
                        },
                        {
                            "key": "registeredAgentEntityName",
                            "type": "input",
                            "props": {
                                "label": "Entity Name",
                                "placeholder": "Enter entity name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.registeredAgentType === 'self' || field.model?.registeredAgentEntityType !== 'entity'"
                            }
                        },
                        {
                            "key": "registeredAgentOfficePosition",
                            "type": "input",
                            "props": {
                                "label": "Office or Position",
                                "placeholder": "Enter office or position",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.registeredAgentType === 'self'"
                            }
                        },
                        {
                            "key": "registeredAgentPhone",
                            "type": "input",
                            "props": {
                                "label": "Phone",
                                "placeholder": "Enter phone number",
                                "required": false
                            },
                            "expressions": {
                                "hide": "field.model?.registeredAgentType === 'self'"
                            }
                        },
                        {
                            "key": "registeredAgentEmail",
                            "type": "input",
                            "props": {
                                "label": "Email",
                                "placeholder": "Enter email address",
                                "required": false
                            },
                            "expressions": {
                                "hide": "field.model?.registeredAgentType === 'self'"
                            }
                        },
                        {
                            "key": "registeredAgentStreetAddress1",
                            "type": "input",
                            "props": {
                                "label": "Street Address 1",
                                "placeholder": "Enter street address",
                                "required": true
                            }
                        },
                        {
                            "key": "registeredAgentStreetAddress2",
                            "type": "input",
                            "props": {
                                "label": "Street Address 2",
                                "placeholder": "Enter street address line 2",
                                "required": false
                            }
                        },
                        {
                            "key": "registeredAgentCity",
                            "type": "input",
                            "props": {
                                "label": "City",
                                "placeholder": "Enter city",
                                "required": true
                            }
                        },
                        {
                            "key": "registeredAgentZip1",
                            "type": "input",
                            "props": {
                                "label": "ZIP Code",
                                "placeholder": "Enter ZIP code",
                                "required": true
                            }
                        }
                    ]
                },
                {
                    "key": "certificateOfFormationSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Certificate of Formation"
                    },
                    "fieldGroup": [
                        {
                            "key": "hasPreparedCertificate",
                            "type": "radio",
                            "props": {
                                "label": "Do you have a prepared Certificate of Formation you would like to upload?",
                                "required": true,
                                "options": [
                                    { "value": "yes", "label": "Yes" },
                                    { "value": "no", "label": "No" }
                                ]
                            }
                        },
                        {
                            "key": "certificateUpload",
                            "type": "file",
                            "props": {
                                "label": "Upload Certificate of Formation",
                                "accept": ".pdf,.jpg,.jpeg",
                                "required": true,
                                "description": "Maximum file size: 10MB. Supported formats: PDF, JPG, JPEG",
                                "category": "business"
                            },
                            "expressions": {
                                "hide": "field.model?.hasPreparedCertificate !== 'yes'"
                            }
                        },
                        {
                            "key": "otherProvisions",
                            "type": "textarea",
                            "props": {
                                "label": "Other Provisions",
                                "placeholder": "Enter any other provisions you would like to include in your formation",
                                "maxLength": 500,
                                "description": "500 character limit"
                            }
                        }
                    ]
                },
                {
                    "key": "principalOfficeSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Principal Office"
                    },
                    "fieldGroup": [
                        {
                            "key": "principalOfficePhone",
                            "type": "input",
                            "props": {
                                "label": "Phone",
                                "placeholder": "Enter phone number",
                                "required": true
                            }
                        },
                        {
                            "key": "principalOfficeEmail",
                            "type": "input",
                            "props": {
                                "label": "Email",
                                "placeholder": "Enter email address",
                                "required": true
                            }
                        },
                        {
                            "key": "principalOfficeEmailConfirm",
                            "type": "input",
                            "props": {
                                "label": "Confirm Email",
                                "placeholder": "Confirm email address",
                                "required": true
                            }
                        },
                        {
                            "key": "principalOfficeAddress1",
                            "type": "input",
                            "props": {
                                "label": "Address 1",
                                "placeholder": "Enter street address",
                                "required": true
                            }
                        },
                        {
                            "key": "principalOfficeCity",
                            "type": "input",
                            "props": {
                                "label": "City",
                                "placeholder": "Enter city",
                                "required": true
                            }
                        },
                        {
                            "key": "principalOfficeState",
                            "type": "select",
                            "props": {
                                "label": "State",
                                "required": true,
                                "options": [
                                    { "value": "WA", "label": "Washington" },
                                    { "value": "AL", "label": "Alabama" },
                                    { "value": "CA", "label": "California" },
                                    { "value": "TX", "label": "Texas" },
                                    { "value": "NY", "label": "New York" }
                                ]
                            }
                        },
                        {
                            "key": "principalOfficeZip1",
                            "type": "input",
                            "props": {
                                "label": "ZIP Code",
                                "placeholder": "Enter ZIP code",
                                "required": true
                            }
                        },
                        {
                            "key": "principalOfficeMailingSameAsStreet",
                            "type": "checkbox",
                            "props": {
                                "label": "Mailing address same as street address"
                            }
                        },
                        {
                            "key": "principalOfficeMailingAddress1",
                            "type": "input",
                            "props": {
                                "label": "Mailing Address 1",
                                "placeholder": "Enter mailing address",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.principalOfficeMailingSameAsStreet"
                            }
                        },
                        {
                            "key": "principalOfficeMailingCity",
                            "type": "input",
                            "props": {
                                "label": "Mailing City",
                                "placeholder": "Enter mailing city",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.principalOfficeMailingSameAsStreet"
                            }
                        },
                        {
                            "key": "principalOfficeMailingState",
                            "type": "select",
                            "props": {
                                "label": "Mailing State",
                                "required": true,
                                "options": [
                                    { "value": "WA", "label": "Washington" },
                                    { "value": "AL", "label": "Alabama" },
                                    { "value": "CA", "label": "California" },
                                    { "value": "TX", "label": "Texas" },
                                    { "value": "NY", "label": "New York" }
                                ]
                            },
                            "expressions": {
                                "hide": "field.model?.principalOfficeMailingSameAsStreet"
                            }
                        },
                        {
                            "key": "principalOfficeMailingZip1",
                            "type": "input",
                            "props": {
                                "label": "Mailing ZIP Code",
                                "placeholder": "Enter mailing ZIP code",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.principalOfficeMailingSameAsStreet"
                            }
                        }
                    ]
                },
                {
                    "key": "durationSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Duration"
                    },
                    "fieldGroup": [
                        {
                            "key": "durationType",
                            "type": "radio",
                            "props": {
                                "label": "Please select the appropriate statement regarding your business's duration",
                                "required": true,
                                "options": [
                                    { "value": "perpetual", "label": "This Company shall have a perpetual duration" },
                                    { "value": "years", "label": "This Company shall have a duration of [X] years" },
                                    { "value": "expire", "label": "This Company shall expire on [date]" }
                                ]
                            }
                        },
                        {
                            "key": "durationYears",
                            "type": "input",
                            "props": {
                                "label": "Number of Years",
                                "placeholder": "Enter number of years",
                                "type": "number",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.durationType !== 'years'"
                            }
                        },
                        {
                            "key": "expirationDate",
                            "type": "datepicker",
                            "props": {
                                "label": "Expiration Date",
                                "placeholder": "Select expiration date (MM/DD/YYYY)",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.durationType !== 'expire'"
                            }
                        }
                    ]
                },
                {
                    "key": "effectiveDateSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Effective Date"
                    },
                    "fieldGroup": [
                        {
                            "key": "effectiveDateType",
                            "type": "radio",
                            "props": {
                                "label": "When would you like this Formation to become effective?",
                                "required": true,
                                "options": [
                                    { "value": "filing", "label": "Date of filing" },
                                    { "value": "specify", "label": "Specify a date" }
                                ],
                                "description": "Effective Date cannot be more than 90 days from today and cannot be prior to the date this record is filed."
                            }
                        },
                        {
                            "key": "effectiveDate",
                            "type": "datepicker",
                            "props": {
                                "label": "Effective Date",
                                "placeholder": "Select effective date (MM/DD/YYYY)",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.effectiveDateType !== 'specify'"
                            }
                        }
                    ]
                },
                {
                    "key": "executorSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Executor Information"
                    },
                    "fieldGroup": [
                        {
                            "key": "iAmExecutor",
                            "type": "checkbox",
                            "props": {
                                "label": "I am an Executor (selecting autofills the filer contact info)"
                            }
                        },
                        {
                            "key": "executorType",
                            "type": "radio",
                            "props": {
                                "label": "Executor Type",
                                "required": true,
                                "options": [
                                    { "value": "individual", "label": "Individual" },
                                    { "value": "entity", "label": "Entity" }
                                ]
                            },
                            "expressions": {
                                "hide": "field.model?.iAmExecutor"
                            }
                        },
                        {
                            "key": "executorFirstName",
                            "type": "input",
                            "props": {
                                "label": "Executor First Name",
                                "placeholder": "Enter first name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmExecutor || field.model?.executorType !== 'individual'"
                            }
                        },
                        {
                            "key": "executorLastName",
                            "type": "input",
                            "props": {
                                "label": "Executor Last Name",
                                "placeholder": "Enter last name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmExecutor || field.model?.executorType !== 'individual'"
                            }
                        },
                        {
                            "key": "executorEntityName",
                            "type": "input",
                            "props": {
                                "label": "Executor Entity Name",
                                "placeholder": "Enter entity name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmExecutor || field.model?.executorType !== 'entity'"
                            }
                        }
                    ]
                },
                {
                    "key": "governorsSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Governors Information"
                    },
                    "fieldGroup": [
                        {
                            "key": "iAmGovernor",
                            "type": "checkbox",
                            "props": {
                                "label": "I am a Governor (adds the filer as a governor)"
                            }
                        },
                        {
                            "key": "governorType",
                            "type": "radio",
                            "props": {
                                "label": "Governor Type",
                                "required": true,
                                "options": [
                                    { "value": "individual", "label": "Individual" },
                                    { "value": "entity", "label": "Entity" }
                                ]
                            },
                            "expressions": {
                                "hide": "field.model?.iAmGovernor"
                            }
                        },
                        {
                            "key": "governorFirstName",
                            "type": "input",
                            "props": {
                                "label": "Governor First Name",
                                "placeholder": "Enter first name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmGovernor || field.model?.governorType !== 'individual'"
                            }
                        },
                        {
                            "key": "governorLastName",
                            "type": "input",
                            "props": {
                                "label": "Governor Last Name",
                                "placeholder": "Enter last name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmGovernor || field.model?.governorType !== 'individual'"
                            }
                        },
                        {
                            "key": "governorEntityName",
                            "type": "input",
                            "props": {
                                "label": "Governor Entity Name",
                                "placeholder": "Enter entity name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmGovernor || field.model?.governorType !== 'entity'"
                            }
                        }
                    ]
                },
                {
                    "key": "natureOfBusinessSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Nature of Business"
                    },
                    "fieldGroup": [
                        {
                            "key": "natureOfBusiness",
                            "type": "multicheckbox",
                            "props": {
                                "label": "What is your business' nature of business? (may select more than one)",
                                "required": true,
                                "options": [
                                    { "value": "ADMIN_BUSINESS_SUPPORT", "label": "ADMINISTRATION & BUSINESS SUPPORT SERVICES" },
                                    { "value": "AGRICULTURE", "label": "AGRICULTURE, FORESTRY, FISHING, HUNTING & TRAPPING" },
                                    { "value": "ANY_LAWFUL", "label": "ANY LAWFUL PURPOSE" },
                                    { "value": "CONSTRUCTION", "label": "CONSTRUCTION" },
                                    { "value": "ENTERTAINMENT", "label": "ENTERTAINMENT, ARTS & RECREATION" },
                                    { "value": "FOOD_BEVERAGES", "label": "FOOD & BEVERAGES" },
                                    { "value": "FOOD_SERVICE", "label": "FOOD SERVICE & RESTAURANT" },
                                    { "value": "HEALTH_CARE", "label": "HEALTH CARE, SOCIAL ASSISTANCE & SERVICE ORGANIZATION" },
                                    { "value": "HOLDING_COMPANY", "label": "HOLDING COMPANY" },
                                    { "value": "LODGING", "label": "LODGING" },
                                    { "value": "MACHINERY", "label": "MACHINERY, EQUIPMENT, COMPUTERS & FURNITURE" },
                                    { "value": "MINING", "label": "MINING" },
                                    { "value": "MOTOR_VEHICLE", "label": "MOTOR VEHICLE, AEROSPACE & OTHER TRANSPORTATION PRODUCTS" },
                                    { "value": "OTHER_MANUFACTURING", "label": "OTHER MANUFACTURING" },
                                    { "value": "OTHER_SERVICES", "label": "OTHER SERVICES" },
                                    { "value": "PRIMARY_METALS", "label": "PRIMARY METALS" },
                                    { "value": "PRIVATE_HOUSEHOLD", "label": "PRIVATE HOUSEHOLD" },
                                    { "value": "PROFESSIONAL", "label": "PROFESSIONAL, SCIENTIFIC & TECHNICAL SERVICES" },
                                    { "value": "PROPERTY_MANAGEMENT", "label": "PROPERTY MANAGEMENT" },
                                    { "value": "PUBLIC_ADMIN", "label": "PUBLIC ADMINISTRATION & EDUCATION" },
                                    { "value": "REAL_ESTATE", "label": "REAL ESTATE" },
                                    { "value": "REAL_PROPERTY_INVESTMENT", "label": "REAL PROPERTY INVESTMENT" },
                                    { "value": "RETAIL", "label": "RETAIL" },
                                    { "value": "TEXTILES", "label": "TEXTILES, CLOTHING & FOOTWEAR" },
                                    { "value": "TRANSPORTATION", "label": "TRANSPORTATION & WAREHOUSING" },
                                    { "value": "UTILITIES", "label": "UTILITIES" },
                                    { "value": "WASTE_MANAGEMENT", "label": "WASTE MANAGEMENT & REMEDIATION SERVICES" },
                                    { "value": "WHOLESALE", "label": "WHOLESALE TRADE" },
                                    { "value": "WOOD_PAPER", "label": "WOOD, PAPER, MINERALS & OTHER PRODUCTS (INCLUDES REFINING & FOUNDRY)" },
                                    { "value": "OTHER", "label": "Other" }
                                ]
                            }
                        },
                        {
                            "key": "otherNatureOfBusiness",
                            "type": "textarea",
                            "props": {
                                "label": "Other Nature of Business",
                                "placeholder": "Please describe your business nature",
                                "maxLength": 500,
                                "required": true,
                                "description": "500 character limit"
                            },
                            "expressions": {
                                "hide": "!field.model?.natureOfBusiness || field.model.natureOfBusiness.indexOf('OTHER') === -1"
                            }
                        }
                    ]
                },
                {
                    "key": "returnAddressSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Return Address for this Filing"
                    },
                    "fieldGroup": [
                        {
                            "key": "returnAddressAttention",
                            "type": "input",
                            "props": {
                                "label": "Attention",
                                "placeholder": "Enter attention line",
                                "required": true
                            }
                        },
                        {
                            "key": "returnAddressEmail",
                            "type": "input",
                            "props": {
                                "label": "Email",
                                "placeholder": "Enter email address",
                                "required": true
                            }
                        },
                        {
                            "key": "returnAddressEmailConfirm",
                            "type": "input",
                            "props": {
                                "label": "Confirm Email",
                                "placeholder": "Confirm email address",
                                "required": true
                            }
                        },
                        {
                            "key": "returnAddress1",
                            "type": "input",
                            "props": {
                                "label": "Address 1",
                                "placeholder": "Enter street address",
                                "required": true
                            }
                        },
                        {
                            "key": "returnAddressCity",
                            "type": "input",
                            "props": {
                                "label": "City",
                                "placeholder": "Enter city",
                                "required": true
                            }
                        },
                        {
                            "key": "returnAddressState",
                            "type": "select",
                            "props": {
                                "label": "State",
                                "required": true,
                                "options": [
                                    { "value": "WA", "label": "Washington" },
                                    { "value": "AL", "label": "Alabama" },
                                    { "value": "CA", "label": "California" },
                                    { "value": "TX", "label": "Texas" },
                                    { "value": "NY", "label": "New York" }
                                ]
                            }
                        },
                        {
                            "key": "returnAddressZip1",
                            "type": "input",
                            "props": {
                                "label": "ZIP Code",
                                "placeholder": "Enter ZIP code",
                                "required": true
                            }
                        }
                    ]
                },
                {
                    "key": "additionalDocumentsSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Additional Documents"
                    },
                    "fieldGroup": [
                        {
                            "key": "hasAdditionalDocuments",
                            "type": "radio",
                            "props": {
                                "label": "Do you have additional documents to upload?",
                                "required": true,
                                "options": [
                                    { "value": "yes", "label": "Yes" },
                                    { "value": "no", "label": "No" }
                                ],
                                "description": "Filings with uploaded documents must be reviewed by OSOS staff. Attachment size limit is 10 MB. (supports only jpg, jpeg, pdf.)"
                            }
                        },
                        {
                            "key": "additionalDocuments",
                            "type": "file",
                            "props": {
                                "label": "Upload Additional Documents",
                                "accept": ".pdf,.jpg,.jpeg",
                                "multiple": true,
                                "required": true,
                                "description": "Maximum file size: 10MB per file. Supported formats: PDF, JPG, JPEG"
                            },
                            "expressions": {
                                "hide": "field.model?.hasAdditionalDocuments !== 'yes'"
                            }
                        }
                    ]
                },
                {
                    "key": "emailOptInSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Email Notifications"
                    },
                    "fieldGroup": [
                        {
                            "key": "emailOptIn",
                            "type": "checkbox",
                            "props": {
                                "label": "By checking this box, I hereby opt into receiving all notifications from the Secretary of State for this entity via email only. I acknowledge that I will no longer receive paper notifications."
                            }
                        }
                    ]
                },
                {
                    "key": "authorizedPersonSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Authorized Person"
                    },
                    "fieldGroup": [
                        {
                            "key": "iAmAuthorizedPerson",
                            "type": "checkbox",
                            "props": {
                                "label": "I am an authorized person (adds the filer information as an authorized person)"
                            }
                        },
                        {
                            "key": "authorizedPersonType",
                            "type": "radio",
                            "props": {
                                "label": "Authorized Person Type",
                                "required": true,
                                "options": [
                                    { "value": "individual", "label": "Individual" },
                                    { "value": "entity", "label": "Entity" }
                                ]
                            },
                            "expressions": {
                                "hide": "field.model?.iAmAuthorizedPerson"
                            }
                        },
                        {
                            "key": "authorizedPersonFirstName",
                            "type": "input",
                            "props": {
                                "label": "First Name",
                                "placeholder": "Enter first name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmAuthorizedPerson || field.model?.authorizedPersonType !== 'individual'"
                            }
                        },
                        {
                            "key": "authorizedPersonLastName",
                            "type": "input",
                            "props": {
                                "label": "Last Name",
                                "placeholder": "Enter last name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmAuthorizedPerson || field.model?.authorizedPersonType !== 'individual'"
                            }
                        },
                        {
                            "key": "authorizedPersonTitle",
                            "type": "input",
                            "props": {
                                "label": "Title",
                                "placeholder": "Enter title",
                                "required": false
                            },
                            "expressions": {
                                "hide": "field.model?.iAmAuthorizedPerson || field.model?.authorizedPersonType !== 'individual'"
                            }
                        },
                        {
                            "key": "authorizedPersonEntityName",
                            "type": "input",
                            "props": {
                                "label": "Entity Name",
                                "placeholder": "Enter entity name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmAuthorizedPerson || field.model?.authorizedPersonType !== 'entity'"
                            }
                        },
                        {
                            "key": "authorizedPersonEntityFirstName",
                            "type": "input",
                            "props": {
                                "label": "Contact First Name",
                                "placeholder": "Enter contact first name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmAuthorizedPerson || field.model?.authorizedPersonType !== 'entity'"
                            }
                        },
                        {
                            "key": "authorizedPersonEntityLastName",
                            "type": "input",
                            "props": {
                                "label": "Contact Last Name",
                                "placeholder": "Enter contact last name",
                                "required": true
                            },
                            "expressions": {
                                "hide": "field.model?.iAmAuthorizedPerson || field.model?.authorizedPersonType !== 'entity'"
                            }
                        },
                        {
                            "key": "authorizedPersonEntityTitle",
                            "type": "input",
                            "props": {
                                "label": "Contact Title",
                                "placeholder": "Enter contact title",
                                "required": false
                            },
                            "expressions": {
                                "hide": "field.model?.iAmAuthorizedPerson || field.model?.authorizedPersonType !== 'entity'"
                            }
                        },
                        {
                            "key": "authorizedPersonAttestation",
                            "type": "checkbox",
                            "props": {
                                "label": "This document is hereby executed under penalty of law and is to the best of my knowledge, true and correct.",
                                "required": true
                            }
                        }
                    ]
                },
                {
                    "key": "initialReportSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Initial Report"
                    },
                    "fieldGroup": [
                        {
                            "key": "initialReportDate",
                            "type": "datepicker",
                            "props": {
                                "label": "Initial Report Filing Date",
                                "placeholder": "Select a date within 120 days of formation",
                                "required": true,
                                "description": "Your initial report must be filed within 120 days of formation."
                            }
                        }
                    ]
                },
                {
                    "key": "optionalDocuments",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Optional Documents"
                    },
                    "fieldGroup": [
                        {
                            "key": "operatingAgreement",
                            "type": "radio",
                            "props": {
                                "label": "Operating Agreement",
                                "required": false,
                                "options": [
                                    { "value": "yes", "label": "I have an Operating Agreement" },
                                    { "value": "no", "label": "I need to create one" }
                                ],
                                "description": "While not required in Washington, an operating agreement is highly recommended."
                            }
                        },
                        {
                            "key": "businessLicenses",
                            "type": "multicheckbox",
                            "props": {
                                "label": "Business Licenses and Permits",
                                "description": "Select the licenses and permits you require assistance with.",
                                "options": [
                                    { "value": "license", "label": "Business License" },
                                    { "value": "permit", "label": "Permit" }
                                ]
                            }
                        }
                    ]
                }
            ]
        }



    }
}