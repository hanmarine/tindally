import '@testing-library/jest-dom'; 
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'), 
  useSearchParams: jest.fn(() => new URLSearchParams()), 
  useParams: jest.fn(() => ({})), 
}));