# RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code_quality** | [**RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification**](RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification.md) |  | 
**coding_speed** | [**RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification**](RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification.md) |  | 
**syntax_error** | [**RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification**](RequestEvalInsertEvaluationArgsScoreboardsCommunicationClarification.md) |  | 

## Example

```python
from convex_client.models.request_eval_insert_evaluation_args_scoreboards_technical_competency import RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency from a JSON string
request_eval_insert_evaluation_args_scoreboards_technical_competency_instance = RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency.from_json(json)
# print the JSON string representation of the object
print(RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency.to_json())

# convert the object into a dict
request_eval_insert_evaluation_args_scoreboards_technical_competency_dict = request_eval_insert_evaluation_args_scoreboards_technical_competency_instance.to_dict()
# create an instance of RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency from a dict
request_eval_insert_evaluation_args_scoreboards_technical_competency_from_dict = RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency.from_dict(request_eval_insert_evaluation_args_scoreboards_technical_competency_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


