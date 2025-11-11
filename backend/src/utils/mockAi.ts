
import { Language } from "../types/user";

// AI assistant conversation flows and responses
const prompts: Record<string, Record<Language, string>> = {
  // Initial greeting
  welcome: {
    en: "Hello! I'm your ZeroFlow assistant. I'm here to help you complete your application quickly and easily. To get started, could you please share your NIN (National Identification Number) or BVN (Bank Verification Number)?",
    yo: "Ẹ ku ọjọ! Emi ni olurapamọ ZeroFlow rẹ. Mo wa nibi lati ran ọ lọwọ lati pari iwe-iforukọsilẹ rẹ ni iyara ati irọrun. Lati bẹrẹ, jọwọ fi NIN (Nọmba Idanimọ Orilẹ-ede) tabi BVN (Nọmba Ijẹrisi Ile-ifowopamọ) rẹ ranṣẹ?",
    ig: "Ndewo! Abụ m onye inyeaka ZeroFlow gị. Anọ m ebe a inyere gị aka mezue ngwugwu gị ngwa ngwa na mfe. Ka anyị malite, biko nye anyị NIN (National Identification Number) ma ọ bụ BVN (Bank Verification Number) gị?",
    ha: "Sannu! Ni ne mai taimakon ZeroFlow ɗinku. Ina nan don in taimake ku kammala aikace-aikacen ku da sauri da sauƙi. Don farawa, don Allah a bayar da NIN (Lambar Shaida ta Ƙasa) ko BVN (Lambar Tabbatar Banki) ɗinku?",
    pidgin: "Hello! I be your ZeroFlow assistant. I dey here to help you finish your application sharp sharp and easy. To start, abeg fit give me your NIN (National Identification Number) or BVN (Bank Verification Number)?",
  },

  // Successful data retrieval
  prefillSuccess: {
    en: "Great! I've found your information in our system. I've automatically filled in your details:\n• Full Name\n• Date of Birth\n• Phone Number\n• Address\n\nPlease review the form below and let me know if you need to update anything or if you're ready to proceed.",
    yo: "O dara! Mo ti ri alaye rẹ ninu eto wa. Mo ti kun awọn alaye rẹ laifọwọyi:\n• Orukọ Kikun\n• Ọjọ Ibi\n• Nọmba Foonu\n• Adirẹsi\n\nJọwọ ṣayẹwo fọọmu ti o wa nisalẹ ki o si sọ fun mi ti o ba nilo lati ṣe imudojuiwọn ohunkohun tabi ti o ba ti ṣetan lati tẹsiwaju.",
    ig: "Ọ dị mma! Achọtala m ozi gị na sistem anyị. Ejupụtala m nkọwa gị na-akpaghị aka:\n• Aha zuru ezu\n• Ụbọchị ọmụmụ\n• Nọmba ekwentị\n• Adreesị\n\nBiko legharịa anya na fọm dị n'okpuru ma gwa m ma ọ bụrụ na ịchọrọ imelite ihe ọ bụla ma ọ bụ ma ị dị njikere ịga n'ihu.",
    ha: "Mai kyau! Na sami bayaninku a cikin tsarin mu. Na cika bayananku kai tsaye:\n• Cikakken Suna\n• Ranar Haihuwa\n• Lambar Waya\n• Adireshi\n\nDon Allah a duba fom ɗin da ke ƙasa kuma ku sanar da ni idan kuna buƙatar sabunta kome ko kuna shirye don ci gaba.",
    pidgin: "Very good! I don find your info for our system. I don fill your details by itself:\n• Full Name\n• Date of Birth\n• Phone Number\n• Address\n\nAbeg check the form wey dey down and tell me if you wan change anything or if you ready to continue.",
  },

  // User not found
  notFound: {
    en: "I couldn't find any records matching that NIN/BVN in our system. This could mean:\n• The number might have a typo\n• You may not be registered yet\n\nWould you like to:\n1. Try entering the number again\n2. Continue with manual registration",
    yo: "Mi o le ri eyikeyi igbasilẹ ti o baamu pẹlu NIN/BVN yẹn ninu eto wa. Eyi le tumọ si:\n• Nọmba naa le ni aṣiṣe kikọ\n• O le jẹ pe o ko tii forukọsilẹ\n\nṢe o fẹ lati:\n1. Gbiyanju lati tẹ nọmba naa sii lẹẹkansi\n2. Tẹsiwaju pẹlu iforukọsilẹ pẹlu ọwọ",
    ig: "Enweghị m ike ịchọta ndekọ ọ bụla dabara na NIN/BVN ahụ na sistem anyị. Nke a nwere ike ịpụta:\n• Nọmba ahụ nwere ike inwe njehie\n• Ị nwere ike ịbụ na edebeghị gị\n\nỊ chọrọ:\n1. Gbalịa itinye nọmba ahụ ọzọ\n2. Gaa n'ihu na ndebanye aha n'aka",
    ha: "Ban sami kowane bayanan da ya dace da wannan NIN/BVN a cikin tsarin mu ba. Wannan na iya nufin:\n• Lambar na iya samun kuskure a rubuce\n• Wataƙila ba ku yi rajista ba tukuna\n\nKuna son:\n1. Gwada shigar da lambar kuma\n2. Ci gaba da yin rajista da hannu",
    pidgin: "I no fit find any record wey match that NIN/BVN for our system. E fit mean say:\n• The number fit get mistake\n• You never register sef\n\nYou wan:\n1. Try put the number again\n2. Continue with manual registration",
  },

  // Request for clarification
  clarification: {
    en: "I'm not sure I understood that correctly. Could you please provide either:\n• Your 11-digit NIN, or\n• Your 11-digit BVN\n\nExample format: 12345678901",
    yo: "Mi ko mọ daju pe mo loye daradara. Jọwọ ṣe o le pese boya:\n• NIN rẹ ti o ni nọmba 11, tabi\n• BVN rẹ ti o ni nọmba 11\n\nApẹẹrẹ ọna kikọ: 12345678901",
    ig: "Aghọtaghị m nke ọma. Biko inye ma:\n• NIN gị nke nwere ọnụọgụgụ 11, ma ọ bụ\n• BVN gị nke nwere ọnụọgụgụ 11\n\nỌmụmaatụ: 12345678901",
    ha: "Ban tabbata na fahimci wannan daidai ba. Don Allah a bayar da ko:\n• NIN ɗinku mai lambobi 11, ko\n• BVN ɗinku mai lambobi 11\n\nMisali: 12345678901",
    pidgin: "I no sure say I understand am well. Abeg fit give me either:\n• Your NIN wey get 11 numbers, or\n• Your BVN wey get 11 numbers\n\nExample: 12345678901",
  },

  // Processing message
  processing: {
    en: "Thank you! Let me search for your information... This will just take a moment.",
    yo: "O ṣeun! Jẹ ki n wa alaye rẹ... Eyi yoo gba igba diẹ.",
    ig: "Daalụ! Ka m chọọ ozi gị... Nke a ga-ewe obere oge.",
    ha: "Na gode! Bari in nemi bayaninku... Wannan zai ɗauki ɗan lokaci kaɗan.",
    pidgin: "Thank you! Make I search your info... E go just take small time.",
  },

  // Error handling
  systemError: {
    en: "I apologize, but I'm experiencing a technical issue right now. Please try again in a moment, or contact our support team if the problem persists.",
    yo: "Mo tọrọ gafara, ṣugbọn mo n ni iṣoro imọ-ẹrọ kan nisisiyi. Jọwọ gbiyanju lẹẹkansi ni akoko diẹ, tabi kan si ẹgbẹ atilẹyin wa ti iṣoro naa ba tẹsiwaju.",
    ig: "Ewela iwe, mana enwere m nsogbu nka ugbu a. Biko gbalịa ọzọ n'oge na-adịghị anya, ma ọ bụ kpọtụrụ ndị otu nkwado anyị ma ọ bụrụ na nsogbu ahụ na-aga n'ihu.",
    ha: "Ina neman gafara, amma ina fuskantar matsalar fasaha a yanzu. Don Allah sake gwadawa nan ba da jimawa ba, ko ku tuntubi ƙungiyar tallafi mu idan matsalar ta ci gaba.",
    pidgin: "I dey sorry, but I get technical problem now now. Abeg try again small time, or call our support people if the problem still dey.",
  },

  // Confirmation
  confirmSubmit: {
    en: "Perfect! Before I submit your application, please confirm that all the information is correct. Once submitted, you'll receive a confirmation email. Should I proceed?",
    yo: "O pe! Ṣaaju ki n fi iwe-iforukọsilẹ rẹ silẹ, jọwọ jẹrisi pe gbogbo alaye naa tọ. Lẹhin ti a ba fi silẹ, iwọ yoo gba imeeli ijẹrisi kan. Ṣe ki n tẹsiwaju?",
    ig: "Ọ zuru oke! Tupu m edobe ngwugwu gị, biko kwenye na ozi niile ziri ezi. Ozugbo edebere ya, ị ga-anata email nkwenye. M̀ ga-aga n'ihu?",
    ha: "Kamala! Kafin in ƙaddamar da aikace-aikacen ku, don Allah ku tabbatar cewa duk bayanan sun dace. Da zarar an ƙaddamar da shi, za ku karɓi imel ɗin tabbatarwa. Zan ci gaba?",
    pidgin: "Perfect! Before I submit your application, abeg confirm say all the info correct. Once I submit am, you go receive email. Make I continue?",
  },
};

// Helper function to get prompt in specified language
export const getPrompt = (key: keyof typeof prompts, language: Language): string => {
  return prompts[key]?.[language] || prompts[key]?.en || "";
};

// Export for use in components
export default prompts;








