# ResponseActionsRunCode


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_actions_run_code import ResponseActionsRunCode

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsRunCode from a JSON string
response_actions_run_code_instance = ResponseActionsRunCode.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsRunCode.to_json())

# convert the object into a dict
response_actions_run_code_dict = response_actions_run_code_instance.to_dict()
# create an instance of ResponseActionsRunCode from a dict
response_actions_run_code_from_dict = ResponseActionsRunCode.from_dict(response_actions_run_code_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


