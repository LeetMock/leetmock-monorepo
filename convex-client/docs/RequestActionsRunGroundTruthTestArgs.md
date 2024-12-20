# RequestActionsRunGroundTruthTestArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**canidate_code** | **str** |  | 
**language** | **str** |  | 
**question_id** | **str** | ID from table \&quot;questions\&quot; | 

## Example

```python
from convex_client.models.request_actions_run_ground_truth_test_args import RequestActionsRunGroundTruthTestArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestActionsRunGroundTruthTestArgs from a JSON string
request_actions_run_ground_truth_test_args_instance = RequestActionsRunGroundTruthTestArgs.from_json(json)
# print the JSON string representation of the object
print(RequestActionsRunGroundTruthTestArgs.to_json())

# convert the object into a dict
request_actions_run_ground_truth_test_args_dict = request_actions_run_ground_truth_test_args_instance.to_dict()
# create an instance of RequestActionsRunGroundTruthTestArgs from a dict
request_actions_run_ground_truth_test_args_from_dict = RequestActionsRunGroundTruthTestArgs.from_dict(request_actions_run_ground_truth_test_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


