# ResponseActionsRunTests


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseActionsRunTestsValue**](ResponseActionsRunTestsValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_actions_run_tests import ResponseActionsRunTests

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsRunTests from a JSON string
response_actions_run_tests_instance = ResponseActionsRunTests.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsRunTests.to_json())

# convert the object into a dict
response_actions_run_tests_dict = response_actions_run_tests_instance.to_dict()
# create an instance of ResponseActionsRunTests from a dict
response_actions_run_tests_from_dict = ResponseActionsRunTests.from_dict(response_actions_run_tests_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


