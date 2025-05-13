import { faker } from '@faker-js/faker';

export const genData = () => {
  const checkin = faker.date.future({ month: 1 });
  const checkout = faker.date.future({ month: 1, refDate: checkin });
  const formattedCheckin = checkin.toISOString().split('T')[0];
  const formattedCheckout = checkout.toISOString().split('T')[0];

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 1000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: formattedCheckin,
      checkout: formattedCheckout,
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'None']),
  };
};


export const generateUpdatedData = (originalData) => {
  const checkin = faker.date.future({ month: 1 });
  const checkout = faker.date.future({ month: 1, refDate: checkin });
  const formattedCheckin = checkin.toISOString().split('T')[0];
  const formattedCheckout = checkout.toISOString().split('T')[0];

  return {
    firstname: originalData.firstname,
    lastname: originalData.lastname,
    totalprice: faker.number.int({ min: 100, max: 1000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: formattedCheckin,
      checkout: formattedCheckout,
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'None']),
  };
};

export const generatePartialUpdate = () => ({
  firstname: faker.person.firstName(),
  lastname: faker.person.lastName(),
});