/**
 * @NApiVersion 2.1
 */
define([],
    () => {
        const SALES_TO_SALES_TERRITORIES = [
            {
                "email": "jscarry@brightsign.biz",
                "empkey": 123923,
                "entity": 123923,
                "territoryData": [
                    {
                        "id": 11,
                        "inactive": "F",
                        "name": "BrightSign US New York Sales Territory",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 41,
                                "ruledescr": "John's Territory (Pennsylvania)",
                                "rulesData": {
                                    "rules": {
                                        "id": 41,
                                        "criteria": "BETWEEN",
                                        "name": "BrightSign Pennsylvania - Metro Philadelphia",
                                        "data2": "17177",
                                        "flddef": "Zip/Postal Code",
                                        "fldkey": "Entity_ZipCode",
                                        "data": [
                                            "17101"
                                        ]
                                    },
                                    "subRules": [
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17042,
                                            "linedata2": null,
                                            "subruleid": 44
                                        },
                                        {
                                            "subcriteria": "BETWEEN",
                                            "linedata": 17742,
                                            "linedata2": 19640,
                                            "subruleid": 57
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17048,
                                            "linedata2": null,
                                            "subruleid": 46
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17057,
                                            "linedata2": null,
                                            "subruleid": 47
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17064,
                                            "linedata2": null,
                                            "subruleid": 48
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17067,
                                            "linedata2": null,
                                            "subruleid": 49
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17070,
                                            "linedata2": null,
                                            "subruleid": 50
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17073,
                                            "linedata2": null,
                                            "subruleid": 51
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17083,
                                            "linedata2": null,
                                            "subruleid": 53
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17085,
                                            "linedata2": null,
                                            "subruleid": 54
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17091,
                                            "linedata2": null,
                                            "subruleid": 56
                                        },
                                        {
                                            "subcriteria": "BETWEEN",
                                            "linedata": 17401,
                                            "linedata2": 17699,
                                            "subruleid": 42
                                        },
                                        {
                                            "subcriteria": "BETWEEN",
                                            "linedata": 17097,
                                            "linedata2": 17098,
                                            "subruleid": 43
                                        },
                                        {
                                            "subcriteria": "BETWEEN",
                                            "linedata": 17077,
                                            "linedata2": 17080,
                                            "subruleid": 52
                                        },
                                        {
                                            "subcriteria": "BETWEEN",
                                            "linedata": 17087,
                                            "linedata2": 17088,
                                            "subruleid": 55
                                        },
                                        {
                                            "subcriteria": "EQUALS",
                                            "linedata": 17046,
                                            "linedata2": null,
                                            "subruleid": 45
                                        }
                                    ]
                                }
                            },
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 6,
                                "ruledescr": "John's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 6,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign US Northeast Territory",
                                        "data2": "",
                                        "flddef": "State",
                                        "fldkey": "Entity_State",
                                        "data": [
                                            "6",
                                            "19",
                                            "21",
                                            "29",
                                            "30",
                                            "32",
                                            "40",
                                            "45",
                                            "46"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "klee@brightsign.biz",
                "empkey": 152662,
                "entity": 152662,
                "territoryData": [
                    {
                        "id": 1,
                        "inactive": "F",
                        "name": "BrightSign US Southwest Sales Territory",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 1,
                                "ruledescr": "Kaleo's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 1,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign US Southwest Territory",
                                        "data2": "",
                                        "flddef": "State",
                                        "fldkey": "Entity_State",
                                        "data": [
                                            "2",
                                            "4",
                                            "11",
                                            "28",
                                            "31"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    },
                    {
                        "id": 10,
                        "inactive": "F",
                        "name": "Brightsign: Sales Territories Carribean Islands",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 15,
                                "ruledescr": "Southeast territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 15,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "Brightsign: Sales Territories Caribbean Islands",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "AI",
                                            "AG",
                                            "AW",
                                            "BS",
                                            "BB",
                                            "KY",
                                            "CU",
                                            "CW",
                                            "DM",
                                            "DO",
                                            "GD",
                                            "GP",
                                            "HT",
                                            "JM",
                                            "MQ",
                                            "MS",
                                            "PR",
                                            "BL",
                                            "KN",
                                            "LC",
                                            "MF",
                                            "VC",
                                            "SX",
                                            "TT",
                                            "TC",
                                            "VG",
                                            "VI"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "mdubois@brightsign.biz",
                "empkey": 148248,
                "entity": 148248,
                "territoryData": [
                    {
                        "id": 13,
                        "inactive": "F",
                        "name": "BrightSign US Northwest Territory",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 28,
                                "ruledescr": "Matt's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 28,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign US Northwest Territory",
                                        "data2": "",
                                        "flddef": "State",
                                        "fldkey": "Entity_State",
                                        "data": [
                                            "1",
                                            "5",
                                            "12",
                                            "26",
                                            "37",
                                            "48",
                                            "51"
                                        ]
                                    },
                                    "subRules": []
                                }
                            },
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 79,
                                "ruledescr": "Matt's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 79,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory Canada",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "CA"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "mchalk@brightsign.biz",
                "empkey": 142375,
                "entity": 142375,
                "territoryData": [
                    {
                        "id": 15,
                        "inactive": "F",
                        "name": "BrightSign US Mid-Atlantic & Federal Government",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 35,
                                "ruledescr": "Misty's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 35,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign US Mid-Atlantic & Federal Government",
                                        "data2": "",
                                        "flddef": "State",
                                        "fldkey": "Entity_State",
                                        "data": [
                                            "7",
                                            "8",
                                            "10",
                                            "20",
                                            "33",
                                            "41",
                                            "47"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "tchluda@brightsign.biz",
                "empkey": 4201,
                "entity": 4201,
                "territoryData": [
                    {
                        "id": 5,
                        "inactive": "F",
                        "name": "BrightSign US Ohio Valley Territory",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 5,
                                "ruledescr": "Tim's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 5,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign US Ohio Valley Territory",
                                        "data2": "",
                                        "flddef": "State",
                                        "fldkey": "Entity_State",
                                        "data": [
                                            "0",
                                            "9",
                                            "14",
                                            "17",
                                            "22",
                                            "35",
                                            "38",
                                            "43",
                                            "49"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "lpennington@brightsign.biz",
                "empkey": 142514,
                "entity": 142514,
                "territoryData": [
                    {
                        "id": 16,
                        "inactive": "F",
                        "name": "BrightSign US TOLA Territory",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 36,
                                "ruledescr": "Linda's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 36,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign US Country Territory",
                                        "data2": "",
                                        "flddef": "State",
                                        "fldkey": "Entity_State",
                                        "data": [
                                            "3",
                                            "18",
                                            "24",
                                            "36",
                                            "44"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "wwang@brightsign.biz",
                "empkey": 136526,
                "entity": 136526,
                "territoryData": [
                    {
                        "id": 14,
                        "inactive": "F",
                        "name": "BrightSign Int'l Territory - East Asia and Pacific",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 12,
                                "ruledescr": "Sales Territory Australia & Pacific",
                                "rulesData": {
                                    "rules": {
                                        "id": 12,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory Australia & Pacific",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "AU",
                                            "FJ",
                                            "KI",
                                            "MH",
                                            "FM",
                                            "NR",
                                            "NZ",
                                            "PW",
                                            "PG",
                                            "WS",
                                            "SB",
                                            "TO",
                                            "TV",
                                            "VU"
                                        ]
                                    },
                                    "subRules": []
                                }
                            },
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 33,
                                "ruledescr": "William's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 33,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory Japan",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "JP"
                                        ]
                                    },
                                    "subRules": []
                                }
                            },
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 34,
                                "ruledescr": "William's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 34,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory Korea",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "KP",
                                            "KR"
                                        ]
                                    },
                                    "subRules": []
                                }
                            },
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 32,
                                "ruledescr": "William's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 32,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory China",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "CN"
                                        ]
                                    },
                                    "subRules": []
                                }
                            },
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 31,
                                "ruledescr": "William's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 31,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory South East Asia",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "KH",
                                            "ID",
                                            "LA",
                                            "MY",
                                            "MM",
                                            "PH",
                                            "SG",
                                            "TH",
                                            "VN"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "pcorsbiesmith@brightsign.biz",
                "empkey": 192012,
                "entity": 192012,
                "territoryData": [
                    {
                        "id": 20,
                        "inactive": "F",
                        "name": "BrightSign International Territory - UK",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 40,
                                "ruledescr": "Paul Corsbie-Smith Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 40,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign UK Territory",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "IE",
                                            "GB"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "pgillet@brightsign.biz",
                "empkey": 4203,
                "entity": 4203,
                "territoryData": [
                    {
                        "id": 8,
                        "inactive": "F",
                        "name": "BrightSign International Territory - Wordwide",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 10,
                                "ruledescr": "Sales Territory Africa",
                                "rulesData": {
                                    "rules": {
                                        "id": 10,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory Africa",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "DZ",
                                            "AO",
                                            "BJ",
                                            "BW",
                                            "BF",
                                            "BI",
                                            "CM",
                                            "CV",
                                            "CF",
                                            "TD",
                                            "KM",
                                            "CD",
                                            "CG",
                                            "CI",
                                            "DJ",
                                            "EG",
                                            "GQ",
                                            "ER",
                                            "ET",
                                            "GA",
                                            "GM",
                                            "GH",
                                            "GN",
                                            "GW",
                                            "VA",
                                            "KE",
                                            "LS",
                                            "LR",
                                            "LY",
                                            "MG",
                                            "MW",
                                            "ML",
                                            "MR",
                                            "MU",
                                            "MA",
                                            "MZ",
                                            "NA",
                                            "NE",
                                            "NG",
                                            "RW",
                                            "ST",
                                            "SN",
                                            "SC",
                                            "SL",
                                            "SO",
                                            "ZA",
                                            "SS",
                                            "SD",
                                            "SZ",
                                            "TZ",
                                            "TG",
                                            "TN",
                                            "UG",
                                            "ZM",
                                            "ZW"
                                        ]
                                    },
                                    "subRules": []
                                }
                            },
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 11,
                                "ruledescr": "Sales Territory Asia",
                                "rulesData": {
                                    "rules": {
                                        "id": 11,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory Asia",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "AF",
                                            "BH",
                                            "BD",
                                            "BT",
                                            "BN",
                                            "IN",
                                            "ID",
                                            "IR",
                                            "IQ",
                                            "IL",
                                            "JO",
                                            "KZ",
                                            "KW",
                                            "KG",
                                            "LB",
                                            "MV",
                                            "MN",
                                            "NP",
                                            "OM",
                                            "PK",
                                            "QA",
                                            "SA"
                                        ]
                                    },
                                    "subRules": []
                                }
                            },
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 9,
                                "ruledescr": "BrightSign Sales Territory Europe",
                                "rulesData": {
                                    "rules": {
                                        "id": 9,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign Sales Territory Europe",
                                        "data2": "",
                                        "flddef": "Country",
                                        "fldkey": "Entity_Country",
                                        "data": [
                                            "AL",
                                            "AD",
                                            "AM",
                                            "AT",
                                            "AZ",
                                            "BY",
                                            "BE",
                                            "BA",
                                            "BG",
                                            "HR",
                                            "CY",
                                            "CZ",
                                            "DK",
                                            "EE",
                                            "FI",
                                            "FR",
                                            "GE",
                                            "DE",
                                            "GR",
                                            "HU",
                                            "IS",
                                            "IE",
                                            "IT",
                                            "XK",
                                            "LV",
                                            "LI",
                                            "LT",
                                            "LU",
                                            "MK",
                                            "MV",
                                            "MT",
                                            "MC",
                                            "ME",
                                            "NL",
                                            "NO",
                                            "PL",
                                            "PT",
                                            "RO",
                                            "RU",
                                            "SM",
                                            "RS",
                                            "SI",
                                            "ES",
                                            "SE",
                                            "CH",
                                            "TR",
                                            "UA",
                                            "GB"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "email": "dmadera@brightsign.biz",
                "empkey": 172503,
                "entity": 172503,
                "territoryData": [
                    {
                        "id": 17,
                        "inactive": "F",
                        "name": "BrightSign US Mid-West Territory",
                        "territoryRules": [
                            {
                                "ruleurl": "/app/crm/sales/customerfieldrule.nl",
                                "rulekey": 38,
                                "ruledescr": "Dave's Territory",
                                "rulesData": {
                                    "rules": {
                                        "id": 38,
                                        "criteria": "ISLISTMEMBER",
                                        "name": "BrightSign US Mid-West Territory",
                                        "data2": "",
                                        "flddef": "State",
                                        "fldkey": "Entity_State",
                                        "data": [
                                            "13",
                                            "15",
                                            "16",
                                            "23",
                                            "25",
                                            "27",
                                            "34",
                                            "42",
                                            "50"
                                        ]
                                    },
                                    "subRules": []
                                }
                            }
                        ]
                    }
                ]
            }
        ];

        return { SALES_TO_SALES_TERRITORIES }
    });
