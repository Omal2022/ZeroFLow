import { User, IsVerified } from "../types/user";

// 10 realistic mock users
export const users: User[] = [
  { id: 1, name: "Chika Okafor", email: "chika@example.com", phone: "08011111111", userIdentity: "NIN", identityValue: "12345678901", address: "Lagos, Nigeria", language: "en" },
  { id: 2, name: "Kessy Umeh", email: "kessy@example.com", phone: "08022222222", userIdentity: "BVN", identityValue: "22345678901", address: "Abuja, Nigeria", language: "yo" },
  { id: 3, name: "Tobi Ade", email: "tobi@example.com", phone: "08033333333", userIdentity: "NIN", identityValue: "32345678901", address: "Ibadan, Nigeria", language: "ig" },
  { id: 4, name: "Amina Bello", email: "amina@example.com", phone: "08044444444", userIdentity: "BVN", identityValue: "42345678901", address: "Kano, Nigeria", language: "ha" },
  { id: 5, name: "Funke Ogundipe", email: "funke@example.com", phone: "08055555555", userIdentity: "NIN", identityValue: "52345678901", address: "Port Harcourt, Nigeria", language: "pidgin" },
  { id: 6, name: "Emeka Nwosu", email: "emeka@example.com", phone: "08066666666", userIdentity: "BVN", identityValue: "62345678901", address: "Enugu, Nigeria", language: "en" },
  { id: 7, name: "Ngozi Okeke", email: "ngozi@example.com", phone: "08077777777", userIdentity: "NIN", identityValue: "72345678901", address: "Lagos, Nigeria", language: "yo" },
  { id: 8, name: "Sani Abubakar", email: "sani@example.com", phone: "08088888888", userIdentity: "BVN", identityValue: "82345678901", address: "Kano, Nigeria", language: "ha" },
  { id: 9, name: "Adaobi Chukwu", email: "adaobi@example.com", phone: "08099999999", userIdentity: "NIN", identityValue: "92345678901", address: "Enugu, Nigeria", language: "ig" },
  { id: 10, name: "Uche Eze", email: "uche@example.com", phone: "08010101010", userIdentity: "BVN", identityValue: "10345678901", address: "Abuja, Nigeria", language: "en" },
];

// Initial verification state
export const verifiedUsers: Record<number, IsVerified> = {};
users.forEach((user: User) => {
  verifiedUsers[user.id] = { verified: "pending" };
});
