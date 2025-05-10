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
                {
                    "key": "registeredAgentSection",
                    "wrappers": ["panel"],
                    "props": {
                        "label": "Registered Agent Information"
                    },
                    "fieldGroup": [
                        {
                            "key": "registeredAgentName",
                            "type": "input",
                            "props": {
                                "label": "Registered Agent Name",
                                "placeholder": "Enter the registered agent's name",
                                "required": true,
                                "description": "Your agent must have a physical Washington address (not a P.O. Box)."
                            }
                        },
                        {
                            "key": "registeredAgentAddress",
                            "type": "input",
                            "props": {
                                "label": "Registered Agent Address",
                                "placeholder": "Enter the physical address",
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
                                //"type": "datepicker",
                                "label": "Initial Report Filing Date",
                                "placeholder": "Select a date within 120 days of formation",
                                "required": true,
                                "description": "Your initial report must be filed within 120 days of formation."
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
                            "key": "ubi",
                            "type": "input",
                            "props": {
                                "label": "Unified Business Identifier (UBI)",
                                "placeholder": "Enter your UBI",
                                "required": true
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