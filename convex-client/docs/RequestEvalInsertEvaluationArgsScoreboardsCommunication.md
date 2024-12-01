# RequestEvalInsertEvaluationArgsScoreboardsCommunication


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**clarification** | [**RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification**](RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification.md) |  | 
**thought_process** | [**RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification**](RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification.md) |  | 

## Example

```python
from convex_client.models.request_eval_insert_evaluation_args_scoreboards_communication import RequestEvalInsertEvaluationArgsScoreboardsCommunication

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEvalInsertEvaluationArgsScoreboardsCommunication from a JSON string
request_eval_insert_evaluation_args_scoreboards_communication_instance = RequestEvalInsertEvaluationArgsScoreboardsCommunication.from_json(json)
# print the JSON string representation of the object
print(RequestEvalInsertEvaluationArgsScoreboardsCommunication.to_json())

# convert the object into a dict
request_eval_insert_evaluation_args_scoreboards_communication_dict = request_eval_insert_evaluation_args_scoreboards_communication_instance.to_dict()
# create an instance of RequestEvalInsertEvaluationArgsScoreboardsCommunication from a dict
request_eval_insert_evaluation_args_scoreboards_communication_from_dict = RequestEvalInsertEvaluationArgsScoreboardsCommunication.from_dict(request_eval_insert_evaluation_args_scoreboards_communication_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


