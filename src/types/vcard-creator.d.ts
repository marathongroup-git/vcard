declare module 'vcard-creator' {
  class VCard {
    constructor();
    addName(lastName: string, firstName: string, additional?: string, prefix?: string, suffix?: string): this;
    addCompany(company: string): this;
    addJobtitle(jobtitle: string): this;
    addEmail(email: string): this;
    addPhoneNumber(number: string, type?: string): this;
    addAddress(address?: string): this;
    addURL(url: string): this;
    addNote(note: string): this;
    addPhoto(url: string): this;
    toString(): string;
  }

  export = VCard;
}