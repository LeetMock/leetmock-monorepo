# ResponseActionsGenerateSolution


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseActionsGenerateSolutionValue**](ResponseActionsGenerateSolutionValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_actions_generate_solution import ResponseActionsGenerateSolution

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsGenerateSolution from a JSON string
response_actions_generate_solution_instance = ResponseActionsGenerateSolution.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsGenerateSolution.to_json())

# convert the object into a dict
response_actions_generate_solution_dict = response_actions_generate_solution_instance.to_dict()
# create an instance of ResponseActionsGenerateSolution from a dict
response_actions_generate_solution_from_dict = ResponseActionsGenerateSolution.from_dict(response_actions_generate_solution_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


