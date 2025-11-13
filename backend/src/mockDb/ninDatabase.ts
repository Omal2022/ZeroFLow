// Mock NIN Database with comprehensive NIMC data structure
export interface NINRecord {
  nin: string;
  access_level: number; // 1-5: Different access tiers
  status: "active" | "inactive";
  demographics: {
    first_name: string;
    middle_name: string;
    last_name: string;
    dob: string; // YYYY-MM-DD
    sex: "Male" | "Female";
    nationality: string;
    place_of_birth: string;
    current_address: string;
    phone_number: string;
    residential_lga: string;
    residential_state: string;
  };
  biometrics: {
    fingerprint_status: string;
    face_photo_url: string;
    signature: string;
  };
  e_id_details: {
    card_number: string;
    status: string;
    issue_date: string;
  };
  enrolment_metadata: {
    centre: string;
    timestamp: string;
    data_quality: "low" | "medium" | "high";
  };
}

// Mock NIN records for testing
export const ninRecords: NINRecord[] = [
  {
    nin: "12345678901",
    access_level: 1,
    status: "active",
    demographics: {
      first_name: "Aisha",
      middle_name: "",
      last_name: "Mohammed",
      dob: "1995-03-15",
      sex: "Female",
      nationality: "Nigerian",
      place_of_birth: "Lagos, Nigeria",
      current_address: "123 Main St, Ikeja, Lagos",
      phone_number: "08012345678",
      residential_lga: "Ikeja",
      residential_state: "Lagos"
    },
    biometrics: {
      fingerprint_status: "captured",
      face_photo_url: "mock_photo_aisha.jpg",
      signature: "mock_signature"
    },
    e_id_details: {
      card_number: "EID123456",
      status: "issued",
      issue_date: "2020-01-01"
    },
    enrolment_metadata: {
      centre: "NIMC Lagos Centre",
      timestamp: "2015-06-20",
      data_quality: "high"
    }
  },
  {
    nin: "23456789012",
    access_level: 3,
    status: "active",
    demographics: {
      first_name: "Chukwuemeka",
      middle_name: "Ifeanyi",
      last_name: "Okonkwo",
      dob: "1988-07-22",
      sex: "Male",
      nationality: "Nigerian",
      place_of_birth: "Enugu, Nigeria",
      current_address: "45 High Rd, Nsukka, Enugu",
      phone_number: "07098765432",
      residential_lga: "Nsukka",
      residential_state: "Enugu"
    },
    biometrics: {
      fingerprint_status: "captured (10 fingers)",
      face_photo_url: "mock_photo_chukwuemeka.jpg",
      signature: "mock_signature"
    },
    e_id_details: {
      card_number: "EID789012",
      status: "expired",
      issue_date: "2018-05-10"
    },
    enrolment_metadata: {
      centre: "NIMC Enugu Centre",
      timestamp: "2010-09-15",
      data_quality: "medium"
    }
  },
  {
    nin: "34567890123",
    access_level: 5,
    status: "active",
    demographics: {
      first_name: "Fatima",
      middle_name: "Zainab",
      last_name: "Abdullahi",
      dob: "2001-11-05",
      sex: "Female",
      nationality: "Nigerian",
      place_of_birth: "Kano, Nigeria",
      current_address: "78 Market Ave, Kano City, Kano",
      phone_number: "09011223344",
      residential_lga: "Kano Municipal",
      residential_state: "Kano"
    },
    biometrics: {
      fingerprint_status: "captured (all 10)",
      face_photo_url: "mock_photo_fatima.jpg",
      signature: "mock_signature"
    },
    e_id_details: {
      card_number: "EID345678",
      status: "active",
      issue_date: "2022-02-14"
    },
    enrolment_metadata: {
      centre: "NIMC Kano Centre",
      timestamp: "2020-03-10",
      data_quality: "high"
    }
  },
  {
    nin: "45678901234",
    access_level: 2,
    status: "inactive",
    demographics: {
      first_name: "John",
      middle_name: "",
      last_name: "Doe",
      dob: "1975-01-01",
      sex: "Male",
      nationality: "Nigerian",
      place_of_birth: "Abuja, Nigeria",
      current_address: "Masked Address, Abuja",
      phone_number: "Masked",
      residential_lga: "Abuja Municipal",
      residential_state: "FCT"
    },
    biometrics: {
      fingerprint_status: "not_available",
      face_photo_url: "",
      signature: ""
    },
    e_id_details: {
      card_number: "",
      status: "not_issued",
      issue_date: ""
    },
    enrolment_metadata: {
      centre: "NIMC Abuja Centre",
      timestamp: "2005-04-01",
      data_quality: "low"
    }
  },
  {
    nin: "56789012345",
    access_level: 4,
    status: "active",
    demographics: {
      first_name: "Adebayo",
      middle_name: "Oluwaseun",
      last_name: "Adeleke",
      dob: "1992-05-18",
      sex: "Male",
      nationality: "Nigerian",
      place_of_birth: "Ibadan, Nigeria",
      current_address: "22 Ring Road, Ibadan, Oyo",
      phone_number: "08123456789",
      residential_lga: "Ibadan North",
      residential_state: "Oyo"
    },
    biometrics: {
      fingerprint_status: "captured (all 10)",
      face_photo_url: "mock_photo_adebayo.jpg",
      signature: "mock_signature"
    },
    e_id_details: {
      card_number: "EID567890",
      status: "active",
      issue_date: "2021-08-20"
    },
    enrolment_metadata: {
      centre: "NIMC Ibadan Centre",
      timestamp: "2018-11-25",
      data_quality: "high"
    }
  }
];

// Mock BVN Database (simplified for demo)
export interface BVNRecord {
  bvn: string;
  first_name: string;
  last_name: string;
  dob: string;
  phone_number: string;
  bank_name: string;
  account_number: string;
}

export const bvnRecords: BVNRecord[] = [
  {
    bvn: "22345678901",
    first_name: "Kessy",
    last_name: "Umeh",
    dob: "1990-08-12",
    phone_number: "08022222222",
    bank_name: "Access Bank",
    account_number: "0123456789"
  },
  {
    bvn: "42345678901",
    first_name: "Amina",
    last_name: "Bello",
    dob: "1985-12-20",
    phone_number: "08044444444",
    bank_name: "GTBank",
    account_number: "0234567890"
  },
  {
    bvn: "62345678901",
    first_name: "Emeka",
    last_name: "Nwosu",
    dob: "1998-03-08",
    phone_number: "08066666666",
    bank_name: "Zenith Bank",
    account_number: "0345678901"
  }
];

// Helper functions
export function findNINRecord(nin: string): NINRecord | null {
  return ninRecords.find(record => record.nin === nin) || null;
}

export function findBVNRecord(bvn: string): BVNRecord | null {
  return bvnRecords.find(record => record.bvn === bvn) || null;
}

// Access level data masking
export function maskDataByAccessLevel(record: NINRecord): Partial<NINRecord> {
  const { access_level } = record;

  if (access_level === 1) {
    // Minimal: Only basic confirmation
    return {
      nin: record.nin,
      access_level: record.access_level,
      status: record.status,
      demographics: {
        first_name: record.demographics.first_name,
        middle_name: "",
        last_name: record.demographics.last_name,
        dob: "****-**-**",
        sex: record.demographics.sex,
        nationality: record.demographics.nationality,
        place_of_birth: "***",
        current_address: "***",
        phone_number: "***",
        residential_lga: "***",
        residential_state: record.demographics.residential_state
      },
      biometrics: {
        fingerprint_status: "restricted",
        face_photo_url: "",
        signature: ""
      },
      e_id_details: {
        card_number: "",
        status: "restricted",
        issue_date: ""
      },
      enrolment_metadata: record.enrolment_metadata
    };
  } else if (access_level === 2) {
    // Basic: Partial data
    return {
      ...record,
      demographics: {
        ...record.demographics,
        phone_number: "Masked",
        current_address: "Masked Address"
      },
      biometrics: {
        fingerprint_status: "not_available",
        face_photo_url: "",
        signature: ""
      }
    };
  } else if (access_level >= 3) {
    // Medium to Full: Return all data
    return record;
  }

  return record;
}
