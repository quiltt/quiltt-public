import React from 'react'
import TestCustomLauncher from './TestCustomLauncher'

describe('<TestCustomLauncher />', () => {
  it('renders', () => {
    cy.mount(<TestCustomLauncher />)

    cy.get('a').should('contains.text', 'Launch with HTML')

    // Wait for script to become interactive. This is almost instananeous locally but takes time in CI.
    cy.wait(1250)

    // Launch the Connector
    cy.get('iframe#quiltt--frame').should('not.exist')
    cy.get('a').click()
    cy.get('iframe#quiltt--frame').should('be.visible')

    // @todo: Check that iframe is rendered. https://github.com/cypress-io/cypress/issues/136
    // cy.get('iframe#quiltt--frame').should('contains.text', 'Stitching finance together')
  })
})