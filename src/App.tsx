import React from 'react';
import { Autocomplete, Box, Button, Option, Select, Typography } from "@mui/joy"

type IntVariable = "transaction.amount" | "transaction.account.balance" | "transaction.account.max_transaction_amount_authorized";
type StringVariable = "transaction.sender.last_name" | "transaction.receiver.last_name" | "transaction.account.owner.last_name";
type Variable = IntVariable | StringVariable;

type Operator = {
  symbol: string;
  validTypes: { left: OperandType, right: OperandType }[];
}

const intVariables: IntVariable[] = ["transaction.amount","transaction.account.balance", "transaction.account.max_transaction_amount_authorized"]
const stringVariables: StringVariable[] = ["transaction.sender.last_name", "transaction.receiver.last_name", "transaction.account.owner.last_name"];
const variables: Variable[] = [...intVariables, ...stringVariables];
const operators: Operator[] = [{
  symbol: "≥",
  validTypes: [{ left: "int", right: "int" }]
}, {
  symbol: "is_close_match",
  validTypes: [{ left: "string", right: "string" }]
}, {
  symbol: "=",
  validTypes: [{ left: "int", right: "int" }, { left: "string", right: "string" }]
}, {
  symbol: "≠",
  validTypes: [{ left: "int", right: "int" }, { left: "string", right: "string" }]
}];

type Formula = {
  leftSide?: string;
  operator: Operator;
  rightSide?: string;
}

type OperandType = "int" | "string" | "invalid";

const intRegex = /^\d+$/;
// strings have to begin and end with ""
const stringRegex = /^".*"$/;

function parseType(string: string): OperandType {
  if (intRegex.test(string) || intVariables.includes(string as IntVariable)) {
    return "int";
  }
  if (stringRegex.test(string) || stringVariables.includes(string as StringVariable)) {
    return "string";
  }

  return "invalid";
}

function App() {
  const [formula, setFormula] = React.useState<Formula>({leftSide: "transaction.amount", operator: operators[0], rightSide: "25"});
  const [error, setError] = React.useState<string>();

  const validateFormula = ({leftSide, operator, rightSide}: Formula) => {
    // Check that all fields are filled
    if (!leftSide || !operator || !rightSide) {
      setError("All fields are required.");
      return;
    }

    const leftType = parseType(leftSide as string);
    const rightType = parseType(rightSide as string);  
  
    // Check that left side is a variable
    if (!variables.includes(leftSide as Variable)) {
      setError("Left side must be a variable.");
      return;
    }

    // Check that right side is a variable, an integer or a string
    if (rightType === "invalid") {
      setError("Right side must be a variable, an integer or a string.");
      return;
    }

    // Check that operator has valid left operand type
    if (operator.validTypes.every(({left}) => left !== leftType)) {
      setError(`Invalid type for operator ${operator.symbol}: can’t be applied to value ${leftSide} of type ${leftType} on the left side.`);
      return;
    }

    // Check that operator has valid right operand type
    if (operator.validTypes.every(({right}) => right !== rightType)) {
      setError(`Invalid type for operator ${operator.symbol}: can’t be applied to value ${rightSide} of type ${rightType} on the right side.`);
      return;
    }

    // Check that operator has valid left and right operand types
    if (operator.validTypes.every(({left, right}) => left !== leftType || right !== rightType)) {
      setError(`Incompatible types for operator ${operator.symbol}: can't be applied to a value ${leftSide} of type ${leftType} on the left side and a value ${rightSide} of type ${rightType} on the right side.`);
      return;
    }

    setError(undefined);  
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    console.log(formula);
  };

  const handleChange = (property: keyof Formula) => (
    _event: React.SyntheticEvent | null,
    newValue: Variable | Operator | number | string | null,
  ) => {
    const newFormula = {...formula, [property]: newValue };
    validateFormula(newFormula);
    setFormula(newFormula);
  };

  return (
    <div>
      <Typography level="h1">My formula builder</Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: "flex", gap: "10px", margin: "5px 0px"}}>
          <Autocomplete sx={{flexGrow: 3}} value={formula.leftSide} options={variables} onChange={handleChange("leftSide")}  />
          <Select sx={{flexGrow: 1}} value={formula.operator} onChange={handleChange("operator")}>
            {operators.map((operator, index) => (
              <Option key={index} value={operator}>{operator.symbol}</Option>
            ))}
          </Select>
          <Autocomplete sx={{flexGrow: 3}} value={formula.rightSide} options={variables} freeSolo={true} onChange={handleChange("rightSide")} />
          { !error && (<Typography sx={{margin: "5px 0px"}}>✅</Typography>) }
        </Box>

          { error && (<Typography sx={{margin: "5px 0px"}} key={error} color='danger'>{error}</Typography>) }

        <Button type="submit" sx={{margin: "5px 0px"}}>Submit</Button>
      </form>
    </div>
  );
}

export default App;
