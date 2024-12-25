import { Cell } from 'ton-core'

export const NftItemEditableCode =
  'B5EE9C72410212010002E5000114FF00F4A413F4BCF2C80B0102016202030202CE0405020120101102012006070201200E0F04F70C8871C02497C0F83434C0C05C6C2497C0F83E903E900C7E800C5C75C87E800C7E800C3C00816CE38596DB088D148CB1C17CB865407E90353E900C040D3C00F801F4C7F4CFE08417F30F45148C2EA3A28C8412040DC409841140B820840BF2C9A8948C2EB8C0A0840701104A948C2EA3A28C8412040DC409841140A008090A0B00113E910C1C2EBCB8536001F65136C705F2E191FA4021F001FA40D20031FA00820AFAF0801CA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E192218E3E821005138D91C8500ACF16500CCF1671244A145446B0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00105894102B385BE20C0080135F03333334347082108B77173504C8CBFF58CF164430128040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0001F65134C705F2E191FA4021F001FA40D20031FA00820AFAF0801CA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E192218E3E8210511A4463C85008CF16500CCF1671244814544690708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00103894102B365BE20D0046E03136373782101A0B9D5116BA9E5131C705F2E19A01D4304400F003E05F06840FF2F00082028E3527F0018210D53276DB103845006D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0093303335E25503F0030082028E3527F0018210D53276DB103848006D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0093303630E25503F00300413B513434CFFE900835D27080271FC07E90353E900C040D440D380C1C165B5B5B600025013232CFD400F3C58073C5B30073C5B27B5520000DBF03A78013628C000BBC7E7F80118400CB5C98'

export const NftItemCode =
  'B5EE9C7241020D010001D0000114FF00F4A413F4BCF2C80B0102016202030202CE04050009A11F9FE00502012006070201200B0C02D70C8871C02497C0F83434C0C05C6C2497C0F83E903E900C7E800C5C75C87E800C7E800C3C00812CE3850C1B088D148CB1C17CB865407E90350C0408FC00F801B4C7F4CFE08417F30F45148C2EA3A1CC840DD78C9004F80C0D0D0D4D60840BF2C9A884AEB8C097C12103FCBC20080900113E910C1C2EBCB8536001F65135C705F2E191FA4021F001FA40D20031FA00820AFAF0801BA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E192218E3E821005138D91C85009CF16500BCF16712449145446A0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00104794102A375BE20A00727082108B77173505C8CBFF5004CF1610248040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB000082028E3526F0018210D53276DB103744006D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0093303234E25502F003003B3B513434CFFE900835D27080269FC07E90350C04090408F80C1C165B5B60001D00F232CFD633C58073C5B3327B5520BF75041B'

export const NftItemEditableCodeCell = Cell.fromBoc(Buffer.from(NftItemEditableCode, 'hex'))[0]

export const NftItemCodeCell = Cell.fromBoc(Buffer.from(NftItemCode, 'hex'))[0]

export const NftSingleCodeBoc =
  'te6cckECFQEAAwoAART/APSkE/S88sgLAQIBYgcCAgEgBAMAI7x+f4ARgYuGRlgOS/uAFoICHAIBWAYFABG0Dp4AQgRr4HAAHbXa/gBNhjoaYfph/0gGEAICzgsIAgEgCgkAGzIUATPFljPFszMye1UgABU7UTQ+kD6QNTUMIAIBIA0MABE+kQwcLry4U2AEuQyIccAkl8D4NDTAwFxsJJfA+D6QPpAMfoAMXHXIfoAMfoAMPACBtMf0z+CEF/MPRRSMLqOhzIQRxA2QBXgghAvyyaiUjC64wKCEGk9OVBSMLrjAoIQHARBKlIwuoBMSEQ4BXI6HMhBHEDZAFeAxMjQ1NYIQGgudURK6n1ETxwXy4ZoB1NQwECPwA+BfBIQP8vAPAfZRNscF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIML/8uGSIY4+ghBRGkRjyFAKzxZQC88WcSRKFFRGsHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEFeUECo4W+IQAIICjjUm8AGCENUydtsQN0UAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwMzTiVQLwAwBUFl8GMwHQEoIQqMsArXCAEMjLBVAFzxYk+gIUy2oTyx/LPwHPFsmAQPsAAIYWXwZsInDIywHJcIIQi3cXNSHIy/8D0BPPFhOAQHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAAfZRN8cF8uGR+kAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIMIA8uGSIY4+ghAFE42RyFALzxZQC88WcSRLFFRGwHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEGeUECo5W+IUAIICjjUm8AGCENUydtsQN0YAbXFwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AJMwNDTiVQLwA+GNLv4='

export const NftSingleCodeCell = Cell.fromBoc(Buffer.from(NftSingleCodeBoc, 'base64'))[0]
