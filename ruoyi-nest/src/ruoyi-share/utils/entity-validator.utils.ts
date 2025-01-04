import { Injectable } from '@nestjs/common';
import { validate, getMetadataStorage } from 'class-validator';

/**
 * Entity validation utilities
 */
@Injectable()
export class EntityValidatorUtils {
  /**
   * Validate object and throw exception if validation fails
   * @param object Object to validate
   * @param groups Validation groups
   * @throws Error with validation errors if validation fails
   */
  public async validate(object: any, groups?: string[]): Promise<void> {
    // Get validation metadata for the object
    const metadataStorage = getMetadataStorage();
    const validationMetadata = metadataStorage.getTargetValidationMetadatas(
      object.constructor,
      '',
      false,
      false,
    );

    // If no validation rules exist, return directly
    if (!validationMetadata || validationMetadata.length === 0) {
      return;
    }

    const errors = await validate(object, {
      groups: groups,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      throw new Error(
        errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; '),
      );
    }
  }
}
