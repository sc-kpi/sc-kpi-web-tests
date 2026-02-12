import { faker } from "@faker-js/faker/locale/uk";

export class TestDataFactory {
  static validLoginData() {
    return {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
    };
  }

  static invalidLoginData() {
    return {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
    };
  }

  static validRegisterData() {
    const password = faker.internet.password({ length: 12 });
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password,
    };
  }

  static randomEmail(): string {
    return faker.internet.email();
  }

  static randomPassword(length = 12): string {
    return faker.internet.password({ length });
  }

  static randomName(): string {
    return faker.person.fullName();
  }
}
