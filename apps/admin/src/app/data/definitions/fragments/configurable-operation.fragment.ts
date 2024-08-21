import { gql } from 'apollo-angular';

export const CONFIGURABLE_OPERATION_DEF_FRAGMENT = gql`
  fragment ConfigurableOperationDef on ConfigurableOperationDefinition {
    args {
      name
      type
      required
      defaultValue
      list
      ui
      label
      description
    }
    code
    description
  }
`;
