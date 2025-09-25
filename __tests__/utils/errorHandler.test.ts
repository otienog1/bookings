import { handleApiError, showErrorToast } from '@/utils/errorHandler'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

describe('Error Handler Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handleApiError', () => {
    it('should handle Response errors', () => {
      const mockResponse = new Response('Not Found', {
        status: 404,
        statusText: 'Not Found'
      })

      const result = handleApiError(mockResponse)

      expect(result).toEqual({
        message: 'HTTP Error: 404',
        code: 'HTTP_ERROR',
        status: 404,
      })
    })

    it('should handle Error objects', () => {
      const error = new Error('Network error')

      const result = handleApiError(error)

      expect(result).toEqual({
        message: 'Network error',
        code: 'UNKNOWN_ERROR',
        status: 500,
      })
    })

    it('should handle string errors', () => {
      const error = 'Something went wrong'

      const result = handleApiError(error)

      expect(result).toEqual({
        message: 'Something went wrong',
        code: 'UNKNOWN_ERROR',
        status: 500,
      })
    })

    it('should handle unknown errors', () => {
      const error = { some: 'object' }

      const result = handleApiError(error)

      expect(result).toEqual({
        message: 'An unknown error occurred',
        code: 'UNKNOWN_ERROR',
        status: 500,
      })
    })
  })

  describe('showErrorToast', () => {
    it('should display error toast with message', () => {
      const apiError = {
        message: 'Test error message',
        code: 'TEST_ERROR',
        status: 400,
      }

      showErrorToast(apiError)

      expect(toast.error).toHaveBeenCalledWith('Test error message')
    })

    it('should display error toast with custom message', () => {
      const apiError = {
        message: 'API error',
        code: 'TEST_ERROR',
        status: 400,
      }

      showErrorToast(apiError, 'Custom error message')

      expect(toast.error).toHaveBeenCalledWith('Custom error message')
    })
  })
})