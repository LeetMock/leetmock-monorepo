# ResponseActionsScheduleEval


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_actions_schedule_eval import ResponseActionsScheduleEval

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsScheduleEval from a JSON string
response_actions_schedule_eval_instance = ResponseActionsScheduleEval.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsScheduleEval.to_json())

# convert the object into a dict
response_actions_schedule_eval_dict = response_actions_schedule_eval_instance.to_dict()
# create an instance of ResponseActionsScheduleEval from a dict
response_actions_schedule_eval_from_dict = ResponseActionsScheduleEval.from_dict(response_actions_schedule_eval_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


