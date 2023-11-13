/// <reference types="cypress" />
import { faker } from '@faker-js/faker';

describe('Job Features', () => { 
    beforeEach(() => {
        cy.visit(Cypress.env('baseUrl'));
    })

    it('Create a new job', () => {
        cy.get(getDataTag('add-job-btn')).click();
        
        let job = getRandomJob();

        // Intercept request from network tab
        cy.intercept('POST', '/api/job').as('createJob');
        
        populateJobForm(job);

        var job_id = null;
        // Waits for the request to be intercepted
        cy.wait('@createJob').then((interception) => {
            job_id = assertJobCreated(interception);
        });

        // Continues after the request is intercepted
        cy.then(() => {
            // Assertions or actions based on the populated job_id
            expect(job_id).to.not.be.null;

            // Assert job creation notification is displayed and job is displayed in the list
            cy.get('.cy-success-snackbar').should('be.visible');
            cy.get('.cy-success-snackbar').should('contain.text', 'Job created successfully');
        });
    })
})

let getRandomJob = () => {
    return {
        jobTitle: faker.person.jobTitle(),
        jobDesc: faker.lorem.paragraph(),
        country: faker.location.country(),
        city: faker.location.city()
    }
}

let getDataTag = (tag) => {
    return `[data-cy=${tag}]`;
}

let populateJobForm = (job) => {
    // Populate job form with random data
    cy.get(getDataTag('input-job-title')).type(job.jobTitle);
    cy.get(getDataTag('input-job-country')).type(job.country);
    cy.get(getDataTag('input-job-city')).type(job.city);
    cy.get(getDataTag('input-job-desc')).type(job.jobDesc);

    // Click next button
    cy.get(getDataTag('btn-job-next')).click();

    // Populate additional information field
    cy.get(getDataTag('select-position-level')).click()
    cy.get(getDataTag('option-associate')).click();
    cy.get(getDataTag('input-job-skills')).type('Cypress, Javascript, HTML, CSS');

    // Click create button
    cy.get(getDataTag('btn-job-create')).click();
}

let assertJobCreated = (interception) => { 
    // Verify request information
    expect(interception.request.method).to.equal('POST');
    expect(interception.response.statusCode).to.equal(201);

    let responseBody = interception.response.body;

    // Verify response body
    let {data, message, route} = responseBody;

    // Verifies returned data properties
    expect(data).to.have.property('city');
    expect(data).to.have.property('country');
    expect(data).to.have.property('description');
    expect(data).to.have.property('job_id');
    expect(data).to.have.property('level');
    expect(data).to.have.property('skills');
    expect(data).to.have.property('title');

    // Verifies returned message
    expect(message).to.equal('Job Created: Data inserted successfully');

    // Verifies returned route
    expect(route).to.equal('/api/job');

    return data.job_id;
}