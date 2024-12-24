# ResponseActionsRunGroundTruthTestValueInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**actual** | **object** |  | 
**case_number** | **float** |  | 
**error** | **str** |  | 
**expected** | **object** |  | 
**input** | **object** |  | 
**passed** | **bool** |  | 
**stdout** | **str** |  | 

## Example

```python
from convex_client.models.response_actions_run_ground_truth_test_value_inner import ResponseActionsRunGroundTruthTestValueInner

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsRunGroundTruthTestValueInner from a JSON string
response_actions_run_ground_truth_test_value_inner_instance = ResponseActionsRunGroundTruthTestValueInner.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsRunGroundTruthTestValueInner.to_json())

# convert the object into a dict
response_actions_run_ground_truth_test_value_inner_dict = response_actions_run_ground_truth_test_value_inner_instance.to_dict()
# create an instance of ResponseActionsRunGroundTruthTestValueInner from a dict
response_actions_run_ground_truth_test_value_inner_from_dict = ResponseActionsRunGroundTruthTestValueInner.from_dict(response_actions_run_ground_truth_test_value_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


