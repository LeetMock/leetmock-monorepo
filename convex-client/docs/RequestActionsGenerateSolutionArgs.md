# RequestActionsGenerateSolutionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**function_name** | **str** |  | 
**input_parameters** | **object** |  | 
**language** | **str** |  | 
**output_type** | **str** |  | 
**question_content** | **str** |  | 
**question_title** | **str** |  | 

## Example

```python
from convex_client.models.request_actions_generate_solution_args import RequestActionsGenerateSolutionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestActionsGenerateSolutionArgs from a JSON string
request_actions_generate_solution_args_instance = RequestActionsGenerateSolutionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestActionsGenerateSolutionArgs.to_json())

# convert the object into a dict
request_actions_generate_solution_args_dict = request_actions_generate_solution_args_instance.to_dict()
# create an instance of RequestActionsGenerateSolutionArgs from a dict
request_actions_generate_solution_args_from_dict = RequestActionsGenerateSolutionArgs.from_dict(request_actions_generate_solution_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


