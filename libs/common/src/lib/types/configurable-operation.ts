export type ConfigurableOperationInput = {
  arguments: ConfigArg[];
  code: string;
};

export type ConfigArg = {
  __typename?: 'ConfigArg';
  name: string;
  /**
   * A JSON stringified representation of the actual value
   */
  value: string;
};

export type ConfigurableOperation = {
  __typename?: 'ConfigurableOperation';
  args: Array<ConfigArg>;
  code: string;
};
