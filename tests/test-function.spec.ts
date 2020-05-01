import { calculate } from "./test-function.service"

describe('test-function', () => {
    it('should calculate properly', () => {
        const result = calculate(2, 3);
        expect(result).toEqual(5);
    })
})