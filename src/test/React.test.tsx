/* eslint-disable @typescript-eslint/no-unused-vars */
import { fireEvent, render, screen, waitFor, } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import keycloak, { ReactKeycloakProvider } from '@react-keycloak/web';

//import AppWrapper from '../AppRouter';
import Group from '../pages/group';
import Home from '../pages/home'
import Keycloak from '../Keycloak';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

describe("Group Page", () => {
  it('renders app',async () => {

    render(
      <ReactKeycloakProvider authClient={Keycloak()} initOptions={{ checkLoginIframe: false }}>
        <BrowserRouter>
        <Home />
        </BrowserRouter>
        </ReactKeycloakProvider>
    )

    screen.debug();


    expect(screen.getByText("Groups!"))

    expect(screen.getByRole("button"))

    expect(screen.getByText("Add Group (Up to 10)")).toBeInTheDocument();
    

    await waitFor(() => {
      //const cards = screen.queryAllByRole("presentation")

      const cards = screen.queryAllByRole("img")

      expect(cards).toHaveLength(2)
      // I'd look for a real text here that is renderer when the data loads
      //expect(container.queryElement('span')).toBeDefined();
    })

    const form = screen.queryByText("Name");

    expect(form).toBeNull();

    
   // expect(screen.getByText("Name"))

    fireEvent.click(screen.getByText("Add Group (Up to 10)"))

    expect(screen.getByText("Name")).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Description');

    const submitButton = screen.getByText('Submit');

    userEvent.type(emailInput, 'johndoe@example.com');
    userEvent.type(nameInput, "idk, a cool new group");



    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      //const items = screen.queryAllByRole('presentation');
      const items = screen.queryAllByRole("img")

      expect(items).toHaveLength(3)
      expect(screen.getByText("Groups!"))
    })
    
    //expect(screen.getByText("Add")).toBeInTheDocument ();

  })
})

/*
describe('App', () => {
  it('renders headline', () => {
    //render(<AppWrapper />);

    screen.debug();

    screen.getByText('Search:');


    expect(screen.getByText('SDOINOINOI@N#OIN!OINFIO')).toBeInTheDocument();
    

    // check if App components renders headline
  });
});

*/

/*

    <ReactKeycloakProvider authClient={Keycloak()} initOptions={{ checkLoginIframe: false }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
  </ReactKeycloakProvider>
  */
