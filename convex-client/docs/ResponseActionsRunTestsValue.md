# ResponseActionsRunTestsValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**exception** | **str** |  | [optional] 
**execution_time** | **float** |  | [optional] 
**is_error** | **bool** |  | 
**status** | **str** |  | 
**stderr** | **str** |  | [optional] 
**stdout** | **str** |  | [optional] 
**test_results** | [**List[ResponseActionsRunGroundTruthTestValueInner]**](ResponseActionsRunGroundTruthTestValueInner.md) |  | [optional] 

## Example

```python
from convex_client.models.response_actions_run_tests_value import ResponseActionsRunTestsValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsRunTestsValue from a JSON string
response_actions_run_tests_value_instance = ResponseActionsRunTestsValue.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsRunTestsValue.to_json())

# convert the object into a dict
response_actions_run_tests_value_dict = response_actions_run_tests_value_instance.to_dict()
# create an instance of ResponseActionsRunTestsValue from a dict
response_actions_run_tests_value_from_dict = ResponseActionsRunTestsValue.from_dict(response_actions_run_tests_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


